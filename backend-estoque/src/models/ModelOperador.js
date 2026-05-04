const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const operadorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
}, { timestamps: true });

// Middleware para criptografar a senha antes de salvar no banco de dados
operadorSchema.pre('save', async function (next) {
  // Só criptografa se a senha foi modificada (ou é nova)
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Método auxiliar para comparar senhas durante o login
operadorSchema.methods.compararSenha = async function (senhaCandidata) {
  return await bcrypt.compare(senhaCandidata, this.senha);
};

module.exports = mongoose.model('Operador', operadorSchema);