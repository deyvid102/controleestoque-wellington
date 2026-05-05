const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importação das Rotas
const routeOperador = require('./routes/RouteOperador');
const routePedido = require('./routes/RoutePedido');
const routeProduto = require('./routes/RouteProduto');

const app = express();
app.use(express.json());
app.use(cors());

// Uso das Rotas
app.use('/operadores', routeOperador); // O login estará em /operadores/login
app.use('/pedidos', routePedido);
app.use('/produtos', routeProduto);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/estoque')
  .then(() => console.log("Conectado ao MongoDB"))
  .catch(err => console.error("Erro MongoDB:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));