const express = require('express');
const router = express.Router();

const {
  obtenerTodasSalidas,
  crearSalida,
  obtenerSalidas,
  actualizarEstatusPago,
  eliminarSalidasPagadas,
  obtenerProductosPorCliente,
  devolverProducto
} = require('../controllers/salidasController');

router.get('/todas', obtenerTodasSalidas);     // TODAS
router.get('/', obtenerSalidas);               // NO PAGADAS
router.post('/', crearSalida);
router.put('/:id/estatus', actualizarEstatusPago);
router.delete('/pagadas', eliminarSalidasPagadas);
router.get('/cliente/:clienteId', obtenerProductosPorCliente);
router.post('/devolver', devolverProducto);


module.exports = router;
