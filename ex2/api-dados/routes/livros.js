const express = require('express');
const router = express.Router();
const Livro = require('../controllers/livro');

// GET /api/livros  (com ?search=X opcional — pesquisa por título ou autor)
router.get('/', (req, res) => {
    const { search } = req.query;
    Livro.list(search)
        .then(dados => res.status(200).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// POST /api/livros  (body: { titulo, autor, paginas, genero })
router.post('/', (req, res) => {
    Livro.insert(req.body)
        .then(dados => res.status(201).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// PUT /api/livros/:id  (body: { lido: boolean })
router.put('/:id', (req, res) => {
    Livro.update(req.params.id, req.body)
        .then(dados => {
            if (dados) res.status(200).json(dados);
            else res.status(404).json({ erro: 'Livro não encontrado.' });
        })
        .catch(err => res.status(500).json({ erro: err.message }));
});

// DELETE /api/livros/:id
router.delete('/:id', (req, res) => {
    Livro.remove(req.params.id)
        .then(dados => {
            if (dados) res.status(200).json({ status: 'Eliminado', dados });
            else res.status(404).json({ erro: 'Livro não encontrado.' });
        })
        .catch(err => res.status(500).json({ erro: err.message }));
});

module.exports = router;
