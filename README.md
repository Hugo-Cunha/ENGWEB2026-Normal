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

# Exercício 1 : Jogos de Tabuleiro — API de Dados

---

## Resumo

Implementação de uma API de dados REST sobre um dataset de 27 jogos de tabuleiro, com persistência em MongoDB e documentação Swagger.

---

## Persistência de Dados

O dataset original (`jogos.json`) foi analisado e validado — sem erros encontrados (IDs únicos, tipos corretos, todos os campos presentes). O campo `id` foi renomeado para `_id` para uso nativo com Mongoose.

A importação para MongoDB é feita automaticamente ao arrancar o Docker Compose através de um container dedicado (`importer`) que:
1. Aguarda o MongoDB ficar disponível (healthcheck)
2. Verifica se a collection já tem dados (para evitar duplicação)
3. Executa `mongoimport --jsonArray`

A API só arranca **depois** do importer terminar com sucesso (`condition: service_completed_successfully`).

**Base de dados:** `jogostabuleiro`
**Collection:** `jogos`

---

## Como Executar

```bash
cd ex1
docker compose down --remove-orphans -v
docker compose up --build
docker compose ps
```

> O `-v` no `down` garante que o volume do Mongo é limpo antes de recriar, evitando dados em falta de runs anteriores.

---

## Rotas Implementadas

| Método | Rota                   | Descrição                                              |
|--------|------------------------|--------------------------------------------------------|
| GET    | `/jogos`               | Lista todos os jogos (id, name, year, category, minPlayers) |
| GET    | `/jogos?editora=EEEE`  | Filtra jogos por nome de editora (id, name, year)      |
| GET    | `/jogos/:id`           | Todos os campos do jogo com esse id                    |
| POST   | `/jogos`               | Adiciona um novo jogo                                  |
| PUT    | `/jogos/:id`           | Atualiza dados de um jogo                              |
| DELETE | `/jogos/:id`           | Elimina um jogo                                        |
| GET    | `/autores`             | Lista de autores ordenada alfabeticamente, com jogos   |
| GET    | `/categorias`          | Lista de categorias ordenada alfabeticamente, com jogos|

Swagger disponível em: `http://localhost:17000/api-docs`

---

## Exemplos curl

```bash
# Listar todos os jogos
curl http://localhost:17000/jogos

# Obter jogo por id
curl http://localhost:17000/jogos/catan

# Filtrar por editora
curl "http://localhost:17000/jogos?editora=KOSMOS"

# Lista de autores
curl http://localhost:17000/autores

# Lista de categorias
curl http://localhost:17000/categorias

# Adicionar jogo
curl -X POST http://localhost:17000/jogos \
  -H "Content-Type: application/json" \
  -d '{
    "_id": "novo-jogo",
    "name": "Novo Jogo",
    "year": 2024,
    "category": "Strategy",
    "minPlayers": 2,
    "maxPlayers": 4,
    "playingTimeMinutes": 60,
    "descriptionEN": "Descrição do jogo.",
    "autores": [{ "id": "autor1", "name": "Autor Um" }],
    "editoras": [{ "id": "ed1", "name": "Editora Um", "country": "Portugal" }],
    "mecanicas": [],
    "premios": []
  }'

# Atualizar jogo
curl -X PUT http://localhost:17000/jogos/catan \
  -H "Content-Type: application/json" \
  -d '{ "maxPlayers": 6 }'

# Eliminar jogo
curl -X DELETE http://localhost:17000/jogos/novo-jogo
```

---

## Queries MongoDB (Exercício 1.2)

Para executar as queries, entrar no container do Mongo:

```bash
docker exec -it mongo_jogos mongosh
use jogostabuleiro
```

```js
// 1. Quantos jogos estão registados?
db.jogos.countDocuments()
// Resultado: 27

// 2. Quantos jogos pertencem à categoria "Family"?
db.jogos.countDocuments({ category: "Family" })
// Resultado: 8

// 3. Lista de autores (alfabética, sem repetições)
db.jogos.aggregate([
  { $unwind: "$autores" },
  { $group: { _id: "$autores.id", name: { $first: "$autores.name" } } },
  { $sort: { name: 1 } },
  { $project: { _id: 0, id: "$_id", name: 1 } }
])

// 4. Distribuição de jogos por ano de lançamento
db.jogos.aggregate([
  { $group: { _id: "$year", total: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])

// 5. Distribuição de jogos por editora
db.jogos.aggregate([
  { $unwind: "$editoras" },
  { $group: { _id: "$editoras.name", total: { $sum: 1 } } },
  { $sort: { _id: 1 } }
])
```

As queries estão também guardadas no ficheiro `queries.txt`.

---

## Serviços Docker

| Container        | Imagem         | Porta  | Função                         |
|------------------|----------------|--------|--------------------------------|
| `mongo_jogos`    | mongo:7        | —      | Base de dados (não exposta)    |
| `jogos_importer` | mongo:7        | —      | Importação única do dataset    |
| `api_jogos`      | node:22-alpine | 17000  | API REST + Swagger             |

---

# Exercício 2 : Jogos de Tabuleiro — API de Dados


---

## Resumo

A partir da análise do ficheiro `index.html` fornecido pelo professor (interface Vue.js), foi derivado o modelo de dados, criada a API de dados correspondente e preparado o ambiente Docker com Nginx a servir a interface estática.

---

## Análise da Interface (Engenharia Reversa)

O `index.html` usa Vue.js 3 + Axios e faz os seguintes pedidos HTTP à API:

| Método | Endpoint                        | Descrição                              |
|--------|---------------------------------|----------------------------------------|
| GET    | `http://localhost:19020/api/livros`          | Lista todos os livros (com `?search=X` opcional) |
| POST   | `http://localhost:19020/api/livros`          | Cria novo livro: `{ titulo, autor, paginas, genero }` |
| PUT    | `http://localhost:19020/api/livros/:id`      | Alterna estado: `{ lido: boolean }` |
| DELETE | `http://localhost:19020/api/livros/:id`      | Remove o livro com esse id |

---

## Modelo de Dados (Mongoose)

Derivado dos campos enviados no POST e do estado gerido pela interface:

```js
{
  titulo:  String,   // obrigatório
  autor:   String,   // obrigatório
  paginas: Number,   // obrigatório
  genero:  String,   // obrigatório
  lido:    Boolean   // default: false
}
```

---

## Persistência de Dados

O dataset inicial (`livros.json`) contém 8 livros de exemplo e é importado automaticamente para MongoDB ao arrancar o Docker Compose, através de um container seeder dedicado. A importação só ocorre se a collection estiver vazia.

**Base de dados:** `leituras`
**Collection:** `livros`

---

## Como Executar

```bash
cd ex2
docker compose down --remove-orphans -v
docker compose up --build
docker compose ps
```

Interface disponível em: `http://localhost:19021`
API disponível em: `http://localhost:19020`

---

## Exemplos curl

```bash
# Listar todos os livros
curl http://localhost:19020/api/livros

# Pesquisar por título ou autor
curl "http://localhost:19020/api/livros?search=tolkien"

# Adicionar livro
curl -X POST http://localhost:19020/api/livros \
  -H "Content-Type: application/json" \
  -d '{ "titulo": "1984", "autor": "George Orwell", "paginas": 328, "genero": "Distopia" }'

# Marcar como lido (substituir <ID> pelo _id real)
curl -X PUT http://localhost:19020/api/livros/<ID> \
  -H "Content-Type: application/json" \
  -d '{ "lido": true }'

# Eliminar livro
curl -X DELETE http://localhost:19020/api/livros/<ID>
```

---

## Serviços Docker

| Container          | Imagem         | Porta  | Função                              |
|--------------------|----------------|--------|-------------------------------------|
| `mongo_leituras`   | mongo:7        | —      | Base de dados (não exposta)         |
| `leituras_seeder`  | mongo:7        | —      | Seed inicial do dataset             |
| `api_leituras`     | node:22-alpine | 19020  | API REST                            |
| `nginx_leituras`   | nginx:alpine   | 19021  | Serve o index.html estático         |

O MongoDB **não está exposto** para o exterior — apenas acessível internamente pela API na rede Docker (`leituras-network`).

---

## Portas Utilizadas

| Serviço              | Porta |
|----------------------|-------|
| EX1 — API Jogos      | 17000 |
| EX2 — API Livros     | 19020 |
| EX2 — Interface Nginx| 19021 |

O MongoDB **não está exposto** para o exterior em nenhum dos exercícios (apenas acessível internamente pela API via rede Docker).

---