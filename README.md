# ENGWEB2026-Normal : Jogos de Tabuleiro + Lista de Leituras
## Data: 25 de Maio de 2026
## EngWeb2026 — Exame de Época Normal
### Feito por
- Hugo Araújo Cunha
- A106808

---

## Resumo

Este repositório contém a resolução completa do exame de época normal de Engenharia Web 2026, dividida em duas pastas:

- `ex1/` — API de dados sobre Jogos de Tabuleiro (MongoDB + Express + Swagger)
- `ex2/` — Engenharia reversa de uma interface Vue.js para Lista de Leituras (MongoDB + Express + Nginx)

---

## Estrutura do Repositório

```
engweb2026/
├── ex1/
│   ├── api-dados/          # API Node.js/Express na porta 17000
│   │   ├── models/         # Modelo Mongoose (Jogo)
│   │   ├── routes/         # Rotas Express
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── dados/          # Dataset jogos.json (27 jogos)
│   │   ├── swagger.yaml    # Documentação Swagger
│   │   ├── import.sh       # Script de importação para MongoDB
│   │   ├── Dockerfile
│   │   └── Dockerfile.importer
│   ├── docker-compose.yml
│   └── queries.txt         # Queries MongoDB (exercício 1.2)
│
└── ex2/
    ├── api-dados/          # API Node.js/Express na porta 19020
    │   ├── models/         # Modelo Mongoose (Livro)
    │   ├── routes/         # Rotas Express
    │   ├── controllers/    # Lógica de negócio
    │   ├── dados/          # Dataset livros.json (8 livros)
    │   ├── seed.sh         # Script de seed para MongoDB
    │   ├── Dockerfile
    │   └── Dockerfile.seeder
    ├── nginx/
    │   ├── index.html      # Interface Vue.js fornecida pelo professor
    │   └── nginx.conf      # Configuração Nginx (porta 19021)
    └── docker-compose.yml
```

---

## Como Executar

### Exercício 1

```bash
cd ex1
docker compose down --remove-orphans -v
docker compose up --build
```

API disponível em: `http://localhost:17000`
Swagger em: `http://localhost:17000/api-docs`

### Exercício 2

```bash
cd ex2
docker compose down --remove-orphans -v
docker compose up --build
```

API disponível em: `http://localhost:19020`
Interface web em: `http://localhost:19021`

---

## Portas Utilizadas

| Serviço              | Porta |
|----------------------|-------|
| EX1 — API Jogos      | 17000 |
| EX2 — API Livros     | 19020 |
| EX2 — Interface Nginx| 19021 |

O MongoDB **não está exposto** para o exterior em nenhum dos exercícios (apenas acessível internamente pela API via rede Docker).