const express = require('express');
const router = express.Router();
const ControlOperador = require('../Controllers/ControlOperador');

// Rota para Autenticação (Login)
// Ela será acessada via POST /operadores/login
router.post('/login', ControlOperador.login);

// Rotas de Gerenciamento (CRUD)
router.post('/', ControlOperador.create);    // Aqui pede Nome, Email e Senha
router.get('/', ControlOperador.getAll);
router.delete('/:id', ControlOperador.delete);

module.exports = router;