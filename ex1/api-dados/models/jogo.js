const mongoose = require('mongoose');

const autorSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const editoraSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String }
}, { _id: false });

const mecanicaSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const premioSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    year: { type: Number }
}, { _id: false });

const jogoSchema = new mongoose.Schema({
    _id: { type: String, required: true },   // usa o id do dataset (ex: "catan")
    name: { type: String, required: true },
    year: { type: Number, required: true },
    category: { type: String, required: true },
    minPlayers: { type: Number, required: true },
    maxPlayers: { type: Number, required: true },
    playingTimeMinutes: { type: Number },
    descriptionEN: { type: String },
    autores: [autorSchema],
    editoras: [editoraSchema],
    mecanicas: [mecanicaSchema],
    premios: [premioSchema]
}, { versionKey: false });

module.exports = mongoose.model('Jogo', jogoSchema);
