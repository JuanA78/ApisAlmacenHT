const express = require('express');
const router = express.Router();
const {
  getProductos,
  createProducto,
  getProductoByCodigoBarras,
  updatePrecioProducto,
  updateProducto, 
  deleteProducto,
  getProductosByMarca
} = require('../controllers/productosController');

router.get('/', getProductos);
router.post('/', createProducto);
router.get('/codigoBarras/:codigo', getProductoByCodigoBarras);
router.put('/:id/precio', updatePrecioProducto);
router.delete('/:id', deleteProducto);
router.put('/:id', updateProducto);
router.get('/marca/:marca', getProductosByMarca);

module.exports = router;
