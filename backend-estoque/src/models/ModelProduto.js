const mongoose = require('mongoose');

const produtosSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  descricao: { type: String},
  custoUni: { type: Number, required: true },
  valorUni: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Produtos', produtosSchema);