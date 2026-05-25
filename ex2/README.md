# Exercício 2 : Lista de Leituras — Engenharia Reversa
## EngWeb2026 — Exame Normal

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