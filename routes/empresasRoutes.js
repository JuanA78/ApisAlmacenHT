const express = require('express');
const router = express.Router();
const {
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
} = require('../controllers/empresasController');

// Rutas
router.get('/', getEmpresas);
router.get('/:id', getEmpresaById);
router.post('/', createEmpresa);
router.put('/:id', updateEmpresa);
router.delete('/:id', deleteEmpresa);

module.exports = router;
