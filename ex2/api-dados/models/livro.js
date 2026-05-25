const mongoose = require('mongoose');

// Modelo derivado da análise do index.html:
//  - POST envia: titulo, autor, paginas, genero
//  - PUT envia: { lido: boolean }
//  - GET devolve lista com _id, titulo, autor, paginas, genero, lido
//  - GET suporta ?search=X (pesquisa por título ou autor)

const livroSchema = new mongoose.Schema({
    titulo:  { type: String, required: true, trim: true },
    autor:   { type: String, required: true, trim: true },
    paginas: { type: Number, required: true },
    genero:  { type: String, required: true, trim: true },
    lido:    { type: Boolean, default: false }
}, {
    versionKey: false,
    timestamps: { createdAt: 'criadoEm', updatedAt: false }
});

module.exports = mongoose.model('Livro', livroSchema);
