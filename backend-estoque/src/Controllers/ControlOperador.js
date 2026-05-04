const Operador = require('../models/ModelOperador');

exports.create = async (req, res) => {
  try {
    const operador = await Operador.create(req.body);
    const { senha, ...dadosOperador } = operador._doc;
    res.status(201).json(dadosOperador);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar operador (email pode já existir)' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const operadores = await Operador.find().select('-senha');
    res.json(operadores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar operadores' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Operador.findByIdAndDelete(req.params.id);
    res.json({ message: 'Operador removido' });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover operador' });
  }
};