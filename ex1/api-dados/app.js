const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();
const PORT = process.env.PORT || 17000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/jogostabuleiro';

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas
const jogosRouter = require('./routes/jogos');
app.use('/', jogosRouter);

// Rota raiz
app.get('/', (req, res) => {
    res.json({ status: 'API Jogos de Tabuleiro a correr', porta: PORT, docs: '/api-docs' });
});

// 404
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Erro genérico
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: err.message });
});

// Ligação ao MongoDB e arranque
mongoose.connect(MONGO_URL)
    .then(() => {
        console.log(`Ligado ao MongoDB: ${MONGO_URL}`);
        app.listen(PORT, () => console.log(`API Jogos na porta ${PORT} | Swagger: http://localhost:${PORT}/api-docs`));
    })
    .catch(err => {
        console.error('Erro ao ligar ao MongoDB:', err.message);
        process.exit(1);
    });
