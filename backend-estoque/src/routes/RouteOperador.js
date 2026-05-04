const express = require('express');
const router = express.Router();
const ControlOperador = require('../Controllers/ControlOperador');

router.post('/', ControlOperador.create);
router.get('/', ControlOperador.getAll);
router.delete('/:id', ControlOperador.delete);

module.exports = router;