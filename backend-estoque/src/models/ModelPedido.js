const mongoose = require('mongoose');

const pedidosSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  quantidade: { type: Number, required: true },
  produto: { type: mongoose.Schema.Types.ObjectId, ref: 'Produtos', required: true },
  status: { type: String, enum: ['E', 'P', 'C'], default: 'P' }, // Entregue, Pendente, Cancelado
  pago: { type: Boolean, default: false },
  dataPedido: { type: Date, default: Date.now },
  dataEntregue: { type: Date },
  total: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Pedidos', pedidosSchema);