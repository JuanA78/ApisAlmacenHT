const express = require('express');
const router = express.Router();

const {
  registrarCompra,
  getEntradas,
  getEntradaById,
  deleteEntradaById
} = require('../controllers/entradasController');

// ENTRADAS
router.post('/', registrarCompra);        // Crear entrada
router.get('/', getEntradas);             // Ver todas
router.get('/:id', getEntradaById);       // Ver una
router.delete('/:id', deleteEntradaById); // Eliminar (solo si CantidadDisponible = 0)

module.exports = router;
