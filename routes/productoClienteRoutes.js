const express = require('express');
const router = express.Router();
const {
  asignarProducto,
  getProductosCliente,
  getProductosPorCliente,
  deleteProductosPorCliente
} = require('../controllers/productoClienteController');

router.post('/', asignarProducto);
router.get('/', getProductosCliente);
router.get('/cliente/:clienteId', getProductosPorCliente);
router.delete('/cliente/:clienteId', deleteProductosPorCliente);

module.exports = router;
