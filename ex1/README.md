# Exercício 1 : Jogos de Tabuleiro — API de Dados
## EngWeb2026 — Exame Normal

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