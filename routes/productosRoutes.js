const express = require('express');
const router = express.Router();
const {
  getProductos,
  createProducto,
  getProductoByCodigoBarras,
  updatePrecioProducto
} = require('../controllers/productosController');

router.get('/', getProductos);
router.post('/', createProducto);
router.get('/codigoBarras/:codigo', getProductoByCodigoBarras);
router.patch('/:id/precio', updatePrecioProducto);

module.exports = router;
