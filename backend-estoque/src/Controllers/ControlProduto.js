const Produtos = require('../models/ModelProduto');

exports.create = async (req, res) => {
  try {
    const produto = await Produtos.create(req.body);
    res.status(201).json(produto);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar produto' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const produtos = await Produtos.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

exports.update = async (req, res) => {
  try {
    const produto = await Produtos.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(produto);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar produto' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Produtos.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produto removido' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover produto' });
  }
};