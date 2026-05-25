const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 19020;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/leituras';

// Middlewares
app.use(morgan('dev'));
app.use(cors());   // necessário para o Vue/Axios no Nginx conseguir chamar a API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas — montadas em /api/livros (exatamente o que o index.html usa)
const livrosRouter = require('./routes/livros');
app.use('/api/livros', livrosRouter);

// Raiz
app.get('/', (req, res) => {
    res.json({ status: 'API Lista de Leituras a correr', porta: PORT });
});

// 404
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Erro
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: err.message });
});

// Arranque
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log(`Ligado ao MongoDB: ${MONGO_URL}`);
        app.listen(PORT, () => console.log(`API Livros na porta ${PORT}`));
    })
    .catch(err => {
        console.error('Erro ao ligar ao MongoDB:', err.message);
        process.exit(1);
    });
