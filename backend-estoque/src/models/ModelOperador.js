const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const operadorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, required: true },
}, { timestamps: true });

// Middleware corrigido: async sem o parâmetro next
operadorSchema.pre('save', async function () {
  // Só criptografa se a senha foi modificada (ou é nova)
  if (!this.isModified('senha')) {
    return; // Apenas sai da função, o Mongoose entende o fluxo
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.senha = await bcrypt.hash(this.senha, salt);
  } catch (err) {
    // Se houver erro aqui, ele será lançado e capturado pelo catch do Controller
    throw new Error('Erro ao processar a senha');
  }
});

operadorSchema.methods.compararSenha = async function (senhaCandidata) {
  return await bcrypt.compare(senhaCandidata, this.senha);
};

module.exports = mongoose.model('Operador', operadorSchema);