const express = require('express');
const router = express.Router();
const ControlPedido = require('../Controllers/ControlPedido');

router.post('/', ControlPedido.create);
router.get('/', ControlPedido.getAll);
router.put('/:id', ControlPedido.updateStatus);
router.delete('/:id', ControlPedido.delete);

module.exports = router;