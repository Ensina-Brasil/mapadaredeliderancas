import json
import random

# Ler o arquivo
with open('pessoas.json', 'r', encoding='utf-8') as f:
    pessoas = json.load(f)

# Definir estados e cidades do Lampiar
estados_lampiar = [
    {"estado_sigla": "MA", "regiao": "Nordeste", "cidade": "São Luís"},
    {"estado_sigla": "ES", "regiao": "Sudeste", "cidade": "Vitória"},
    {"estado_sigla": "MS", "regiao": "Centro-Oeste", "cidade": "Dourados"},
    {"estado_sigla": "MS", "regiao": "Centro-Oeste", "cidade": "Campo Grande"}
]

# Contador
count = 0

# Atualizar pessoas do Lampiar
for pessoa in pessoas:
    if pessoa.get("programa") == "Lampiar":
        # Escolher aleatoriamente um dos estados
        estado_info = random.choice(estados_lampiar)
        pessoa["estado_sigla"] = estado_info["estado_sigla"]
        pessoa["regiao"] = estado_info["regiao"]
        pessoa["cidade"] = estado_info["cidade"]
        count += 1

print(f"✓ {count} pessoas do Lampiar atualizadas")

# Verificar distribuição
ma = sum(1 for p in pessoas if p.get("programa") == "Lampiar" and p["estado_sigla"] == "MA")
es = sum(1 for p in pessoas if p.get("programa") == "Lampiar" and p["estado_sigla"] == "ES")
ms = sum(1 for p in pessoas if p.get("programa") == "Lampiar" and p["estado_sigla"] == "MS")

print(f"Distribuição: MA={ma}, ES={es}, MS={ms}")

# Salvar arquivo
with open('pessoas.json', 'w', encoding='utf-8') as f:
    json.dump(pessoas, f, ensure_ascii=False, indent=2)

print("✓ Arquivo salvo")
