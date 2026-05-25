const Jogo = require('../models/jogo');

// GET /jogos  (opcionalmente ?editora=EEEE)
module.exports.list = (editora) => {
    if (editora) {
        // Filtra jogos que tenham editoras cujo nome corresponda
        return Jogo.find(
            { 'editoras.name': { $regex: new RegExp(editora, 'i') } },
            { _id: 1, name: 1, year: 1 }
        ).sort({ name: 1 }).exec();
    }
    return Jogo.find({}, { _id: 1, name: 1, year: 1, category: 1, minPlayers: 1 })
               .sort({ name: 1 }).exec();
};

// GET /jogos/:id
module.exports.findById = (id) => {
    return Jogo.findOne({ _id: id }).exec();
};

// GET /autores
module.exports.listAutores = () => {
    return Jogo.aggregate([
        { $unwind: '$autores' },
        {
            $group: {
                _id: '$autores.id',
                name: { $first: '$autores.name' },
                jogos: { $push: { id: '$_id', name: '$name' } }
            }
        },
        { $sort: { name: 1 } },
        { $project: { _id: 0, id: '$_id', name: 1, jogos: 1 } }
    ]).exec();
};

// GET /categorias
module.exports.listCategorias = () => {
    return Jogo.aggregate([
        {
            $group: {
                _id: '$category',
                jogos: { $push: { id: '$_id', name: '$name' } }
            }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, categoria: '$_id', jogos: 1 } }
    ]).exec();
};

// POST /jogos
module.exports.insert = (data) => {
    // Aceita tanto 'id' como '_id' no body
    if (data.id && !data._id) {
        data._id = data.id;
        delete data.id;
    }
    const novo = new Jogo(data);
    return novo.save();
};

// PUT /jogos/:id
module.exports.update = (id, data) => {
    // Não deixa alterar o _id
    delete data._id;
    delete data.id;
    return Jogo.updateOne({ _id: id }, { $set: data }).exec();
};

// DELETE /jogos/:id
module.exports.remove = (id) => {
    return Jogo.deleteOne({ _id: id }).exec();
};
