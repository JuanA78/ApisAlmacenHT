const express = require('express');

const router = express.Router();

const {
    crearAuditoria,
    obtenerAuditorias,
    obtenerAuditoriaPorId,
    actualizarAuditoria,
    eliminarAuditoria
} = require('../controllers/auditoriaController');


router.post('/', crearAuditoria);

router.get('/', obtenerAuditorias);

router.get('/:id', obtenerAuditoriaPorId);

router.put('/:id', actualizarAuditoria);

router.delete('/:id', eliminarAuditoria);


module.exports = router;