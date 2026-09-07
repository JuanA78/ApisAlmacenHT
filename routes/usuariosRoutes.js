const express = require('express');

const router = express.Router();

const usuariosController = require('../controllers/usuariosController');
const verificarToken = require('../middleware/authMiddleware');


// Crear usuario
router.post('/',verificarToken, usuariosController.createUsuario);
// Iniciar sesión
router.post('/login', usuariosController.login);
// Obtener todos
router.get('/',verificarToken, usuariosController.getUsuarios);
// Buscar por nombre
router.get('/buscar/:nombre',verificarToken, usuariosController.buscarUsuarioPorNombre);
// Eliminar
router.delete('/:id',verificarToken, usuariosController.deleteUsuario);
// cambiar contrseña 
router.put('/:cambiarPassword',verificarToken, usuariosController.cambiarPassword);
module.exports = router;