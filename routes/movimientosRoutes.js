const express = require('express');
const router = express.Router();
const {
  registrarEntrada,
  registrarSalida,
  getMovimientos,
  deleteMovimientos,
  updateEstatusMovimiento
} = require('../controllers/movimientosController');

router.post('/entrada', registrarEntrada);
router.post('/salida', registrarSalida);
router.get('/', getMovimientos);
router.delete('/', deleteMovimientos);
router.put('/:id/estatus', updateEstatusMovimiento);

module.exports = router;

