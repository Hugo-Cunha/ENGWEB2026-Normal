const express = require('express');
const router = express.Router();
const Jogo = require('../controllers/jogo');

// IMPORTANTE: rotas específicas ANTES de /:id

// GET /autores
router.get('/autores', (req, res) => {
    Jogo.listAutores()
        .then(dados => res.status(200).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// GET /categorias
router.get('/categorias', (req, res) => {
    Jogo.listCategorias()
        .then(dados => res.status(200).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// GET /jogos  (com ?editora=EEEE opcional)
router.get('/jogos', (req, res) => {
    const { editora } = req.query;
    Jogo.list(editora)
        .then(dados => res.status(200).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// GET /jogos/:id
router.get('/jogos/:id', (req, res) => {
    Jogo.findById(req.params.id)
        .then(dados => {
            if (dados) res.status(200).json(dados);
            else res.status(404).json({ erro: 'Jogo não encontrado.' });
        })
        .catch(err => res.status(500).json({ erro: err.message }));
});

// POST /jogos
router.post('/jogos', (req, res) => {
    Jogo.insert(req.body)
        .then(dados => res.status(201).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// PUT /jogos/:id
router.put('/jogos/:id', (req, res) => {
    Jogo.update(req.params.id, req.body)
        .then(dados => res.status(200).json(dados))
        .catch(err => res.status(500).json({ erro: err.message }));
});

// DELETE /jogos/:id
router.delete('/jogos/:id', (req, res) => {
    Jogo.remove(req.params.id)
        .then(dados => res.status(200).json({ status: 'Eliminado', resultado: dados }))
        .catch(err => res.status(500).json({ erro: err.message }));
});

module.exports = router;
