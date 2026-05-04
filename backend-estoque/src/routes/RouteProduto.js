const express = require('express');
const router = express.Router();
const ControlProduto = require('../Controllers/ControlProduto');

router.post('/', ControlProduto.create);
router.get('/', ControlProduto.getAll);
router.put('/:id', ControlProduto.update);
router.delete('/:id', ControlProduto.delete);

module.exports = router;