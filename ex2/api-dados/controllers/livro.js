const Livro = require('../models/livro');

// GET /api/livros  (com ?search=X opcional)
module.exports.list = (search) => {
    if (search) {
        const regex = new RegExp(search, 'i');
        return Livro.find({
            $or: [
                { titulo: { $regex: regex } },
                { autor:  { $regex: regex } }
            ]
        }).sort({ titulo: 1 }).exec();
    }
    return Livro.find().sort({ titulo: 1 }).exec();
};

// GET /api/livros/:id
module.exports.findById = (id) => {
    return Livro.findById(id).exec();
};

// POST /api/livros
module.exports.insert = (data) => {
    const novo = new Livro(data);
    return novo.save();
};

// PUT /api/livros/:id  (apenas altera o campo lido)
module.exports.update = (id, data) => {
    return Livro.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
};

// DELETE /api/livros/:id
module.exports.remove = (id) => {
    return Livro.findByIdAndDelete(id).exec();
};
