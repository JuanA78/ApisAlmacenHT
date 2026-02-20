const express = require('express');
const router = express.Router();
const empresaController = require('../controllers/empresasController');

router.get('/', empresaController.getEmpresas);
router.get('/:id', empresaController.getEmpresaById);
router.post('/', empresaController.createEmpresa);
router.put('/:id', empresaController.updateEmpresa);
router.delete('/:id', empresaController.deleteEmpresa);

module.exports = router;
