const SPREADSHEET_ID = "1VsPEtTJfoE5mmmkwEaYoYzhfCq6b5S4ge6EEx6aT7ek";
const SHEET_ACCESS_CODES = "SENHAS DE ACESSO";
const SHEET_PEOPLE = "IMPORTADO_NOVO";

const ALLOWED_FIELDS = [
  "Nome",
  "Programa",
  "Turma",
  "Cidade",
  "Estado",
  "Cargo",
  "Organização",
  "Linkedin"
];

const MAX_GLOBAL_ATTEMPTS_PER_5_MIN = 120;
const MAX_CODE_ATTEMPTS_PER_10_MIN = 12;

function doPost(e) {
  try {
    if (globalRateLimited_()) {
      return jsonResponse_({ ok: false, error: "invalid_code" });
    }

    const payload = parseJsonBody_(e);
    const codigo = normalizeAccessCode_(payload.codigo);

    if (!codigo) {
      return jsonResponse_({ ok: false, error: "invalid_code" });
    }

    if (codeRateLimited_(codigo)) {
      return jsonResponse_({ ok: false, error: "invalid_code" });
    }

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const accessSheet = spreadsheet.getSheetByName(SHEET_ACCESS_CODES);
    if (!accessSheet) {
      throw new Error(`Aba não encontrada: ${SHEET_ACCESS_CODES}`);
    }

    const isValid = accessCodeExists_(accessSheet, codigo);
    if (!isValid) {
      registerFailedAttempt_(codigo);
      return jsonResponse_({ ok: false, error: "invalid_code" });
    }

    const peopleSheet = spreadsheet.getSheetByName(SHEET_PEOPLE);
    if (!peopleSheet) {
      throw new Error(`Aba não encontrada: ${SHEET_PEOPLE}`);
    }

    const pessoas = loadSanitizedPeople_(peopleSheet);
    return jsonResponse_({
      ok: true,
      pessoas
    });
  } catch (error) {
    console.error(error);
    return jsonResponse_({
      ok: false,
      error: "server_error"
    });
  }
}

function doGet() {
  return jsonResponse_({
    ok: false,
    error: "method_not_allowed"
  });
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (_) {
    return {};
  }
}

function normalizeAccessCode_(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/\.0$/, "")
    .toUpperCase();
}

function accessCodeExists_(sheet, codigo) {
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getDisplayValues().flat();
  return values.some(item => normalizeAccessCode_(item) === codigo);
}

function loadSanitizedPeople_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (!values.length) return [];

  const headers = values[0];
  const headerIndex = headers.reduce((acc, header, index) => {
    acc[normalizeHeader_(header)] = index;
    return acc;
  }, {});

  return values
    .slice(1)
    .filter(row => row.some(cell => String(cell || "").trim() !== ""))
    .map(row => ({
      Nome: pickCell_(row, headerIndex, "Nome"),
      Programa: pickCell_(row, headerIndex, "Programa"),
      Turma: normalizeCohort_(pickCell_(row, headerIndex, "Turma")),
      Cidade: pickCell_(row, headerIndex, "Cidade"),
      Estado: pickCell_(row, headerIndex, "Estado"),
      Cargo: pickCell_(row, headerIndex, "Cargo"),
      "Organização": pickCell_(row, headerIndex, "Organização") || pickCell_(row, headerIndex, "Organizacao"),
      Linkedin: pickCell_(row, headerIndex, "Linkedin")
    }))
    .filter(item => String(item.Nome || "").trim() !== "");
}

function pickCell_(row, headerIndex, fieldName) {
  const index = headerIndex[normalizeHeader_(fieldName)];
  if (index === undefined) return "";
  return String(row[index] || "").trim();
}

function normalizeHeader_(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeCohort_(value) {
  return String(value || "").trim().replace(/\.0$/, "");
}

function globalRateLimited_() {
  const cache = CacheService.getScriptCache();
  const bucket = `global:${Math.floor(Date.now() / (5 * 60 * 1000))}`;
  const current = Number(cache.get(bucket) || "0");
  cache.put(bucket, String(current + 1), 5 * 60);
  return current >= MAX_GLOBAL_ATTEMPTS_PER_5_MIN;
}

function codeRateLimited_(codigo) {
  const cache = CacheService.getScriptCache();
  const key = `code:${sha256_(codigo)}`;
  const current = Number(cache.get(key) || "0");
  return current >= MAX_CODE_ATTEMPTS_PER_10_MIN;
}

function registerFailedAttempt_(codigo) {
  const cache = CacheService.getScriptCache();
  const key = `code:${sha256_(codigo)}`;
  const current = Number(cache.get(key) || "0");
  cache.put(key, String(current + 1), 10 * 60);
}

function sha256_(value) {
  const digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  );

  return digest
    .map(byte => {
      const normalized = byte < 0 ? byte + 256 : byte;
      return normalized.toString(16).padStart(2, "0");
    })
    .join("");
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
