const express = require('express');
const router = express.Router();
const {
  getClientes,
  createCliente,
  getClienteById,
  updateCliente,
  deleteCliente
} = require('../controllers/clientesController');

// Rutas
router.get('/', getClientes);
router.get('/:id', getClienteById);
router.post('/', createCliente);
router.put('/:id', updateCliente);
router.delete('/:id', deleteCliente);

module.exports = router;
