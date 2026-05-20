const fs = require("fs");

// Estados, regiões, cidades para sortear
const estados = {
  AC: { regiao: "Norte", cidades: ["Rio Branco", "Cruzeiro do Sul", "Sena Madureira"] },
  AL: { regiao: "Nordeste", cidades: ["Maceió", "Arapiraca", "Palmeira dos Índios"] },
  AM: { regiao: "Norte", cidades: ["Manaus", "Parintins", "Itacoatiara"] },
  AP: { regiao: "Norte", cidades: ["Macapá", "Santana", "Laranjal do Jari"] },
  BA: { regiao: "Nordeste", cidades: ["Salvador", "Feira de Santana", "Vitória da Conquista"] },
  CE: { regiao: "Nordeste", cidades: ["Fortaleza", "Juazeiro do Norte", "Sobral"] },
  DF: { regiao: "Centro-Oeste", cidades: ["Brasília"] },
  ES: { regiao: "Sudeste", cidades: ["Vitória", "Serra", "Vila Velha"] },
  GO: { regiao: "Centro-Oeste", cidades: ["Goiânia", "Anápolis", "Águas Lindas de Goiás"] },
  MA: { regiao: "Nordeste", cidades: ["São Luís", "Imperatriz", "Caxias"] },
  MG: { regiao: "Sudeste", cidades: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"] },
  MS: { regiao: "Centro-Oeste", cidades: ["Campo Grande", "Dourados", "Três Lagoas"] },
  MT: { regiao: "Centro-Oeste", cidades: ["Cuiabá", "Rondonópolis", "Sinop"] },
  PA: { regiao: "Norte", cidades: ["Belém", "Ananindeua", "Santarém"] },
  PB: { regiao: "Nordeste", cidades: ["João Pessoa", "Campina Grande", "Patos"] },
  PE: { regiao: "Nordeste", cidades: ["Recife", "Olinda", "Jaboatão dos Guararapes"] },
  PI: { regiao: "Nordeste", cidades: ["Teresina", "Parnaíba", "Picos"] },
  PR: { regiao: "Sul", cidades: ["Curitiba", "Londrina", "Maringá"] },
  RJ: { regiao: "Sudeste", cidades: ["Rio de Janeiro", "Niterói", "Campos dos Goytacazes"] },
  RN: { regiao: "Nordeste", cidades: ["Natal", "Mossoró", "Caicó"] },
  RO: { regiao: "Norte", cidades: ["Porto Velho", "Ji-Paraná", "Ariquemes"] },
  RR: { regiao: "Norte", cidades: ["Boa Vista", "Rorainópolis"] },
  RS: { regiao: "Sul", cidades: ["Porto Alegre", "Caxias do Sul", "Pelotas"] },
  SC: { regiao: "Sul", cidades: ["Florianópolis", "Joinville", "Blumenau"] },
  SE: { regiao: "Nordeste", cidades: ["Aracaju", "Estância", "Lagarto"] },
  SP: { regiao: "Sudeste", cidades: ["São Paulo", "Campinas", "Santos"] },
  TO: { regiao: "Norte", cidades: ["Palmas", "Gurupi", "Araguaína"] }
};

// Funções de sorteio
const nomes = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Joana",
  "Karina", "Lucas", "Mariana", "Nathan", "Olivia", "Paulo", "Quezia", "Rafael", "Sofia", "Tiago",
  "Ursula", "Vitória", "William", "Xênia", "Yuri", "Zuleica"];

const sobrenomes = ["Almeida", "Barros", "Cardoso", "Dias", "Esteves", "Ferreira", "Gomes", "Henrique",
  "Ibrahim", "Jesus", "Klein", "Lima", "Macedo", "Nascimento", "Oliveira", "Pereira", "Queiroz",
  "Ramos", "Silva", "Trindade", "Uchoa", "Vieira", "Werneck", "Xavier", "Yamamoto", "Zago"];

function sort(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const funcoes = ["Gestor escolar", "Professor", "Supervisor", "Coordenador", "Secretário escolar", "Voluntário", "Consultor", "Analista"];
const turmas = ["2017", "2018", "2019", "2020", "2021", "2022", "2023"];
const programas = ["Trainee Ensina Brasil", "Impulso", "Lampiar"];
const instituicoes = [
  "Ensina Brasil",
  "Fundação Lemann",
  "Instituto Ayrton Senna",
  "Instituto Unibanco",
  "Natura Educação",
  "Instituto Reúna",
  "ICE - Interdisciplinaridade e Evidências",
  "Fundação Roberto Marinho",
  "CENPEC Educação",
  "Movimento Pela Base",
  "Instituto Sonho Grande",
  "Educação 360",
  "Fundação Telefônica Vivo",
  "Vozes da Educação",
  "NAVE - Oi Futuro",
  "Movimento Colabora Educação",
  "Todos Pela Educação",
  "Porvir",
  "Fundação Maria Cecilia Souto Vidigal",
  "Instituto Alana"
];

// Quantidades por programa
const QTD_TRAINEE = 704;
const QTD_IMPULSO = 50;
const QTD_LAMPIAR = 50;
const TOTAL = QTD_TRAINEE + QTD_IMPULSO + QTD_LAMPIAR;

let pessoas = [];

for (let i = 1; i <= TOTAL; i++) {
  const estadoSigla = sort(Object.keys(estados));
  const estado = estados[estadoSigla];

  const nome = `${sort(nomes)} ${sort(sobrenomes)}`;
  const cidade = sort(estado.cidades);
  const linkedin = `https://www.linkedin.com/in/${nome.toLowerCase().replace(/ /g, "-")}-${i}`;

  // Determina o programa baseado no índice
  let programa;
  let turma;
  
  if (i <= QTD_TRAINEE) {
    programa = "Trainee Ensina Brasil";
    turma = sort(turmas); // Turmas variadas para Trainee
  } else if (i <= QTD_TRAINEE + QTD_IMPULSO) {
    programa = "Impulso";
    turma = "2025"; // Impulso: todos 2025
  } else {
    programa = "Lampiar";
    turma = "2025"; // Lampiar: todos 2025
  }

  pessoas.push({
    nome,
    turma: turma,
    funcao: sort(funcoes),
    programa: programa,
    regiao: estado.regiao,
    estado_sigla: estadoSigla,
    cidade,
    linkedin,
    instituicao: sort(instituicoes)
  });
}

// grava o arquivo
fs.writeFileSync("pessoas.json", JSON.stringify(pessoas, null, 2), "utf-8");

console.log(`Arquivo pessoas.json gerado com ${TOTAL} pessoas!`);
console.log(`- Trainee Ensina Brasil: ${QTD_TRAINEE}`);
console.log(`- Impulso: ${QTD_IMPULSO}`);
console.log(`- Lampiar: ${QTD_LAMPIAR}`);
