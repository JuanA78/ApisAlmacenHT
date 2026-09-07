const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// ========================================
// CREAR USUARIO
// ========================================

const createUsuario = async (req, res) => {
  try {
    const { nombre, usuario, password, rol } = req.body;

    // Validar campos obligatorios
    if (!nombre || !usuario || !password) {
      return res.status(400).json({
        error: 'Nombre, usuario y contraseña son obligatorios'
      });
    }

    // Validar rol
    if (rol && !['administrador', 'user'].includes(rol)) {
      return res.status(400).json({
        error: 'El rol debe ser administrador o user'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ usuario });

    if (usuarioExiste) {
      return res.status(400).json({
        error: 'El usuario ya existe'
      });
    }

    // Encriptar/hash de contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      usuario,
      password: passwordHash,
      rol: rol || 'user'
    });

    await nuevoUsuario.save();

    // No devolver password
    res.status(201).json({
      message: 'Usuario creado correctamente',
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        usuario: nuevoUsuario.usuario,
        rol: nuevoUsuario.rol
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al crear usuario'
    });
  }
};


// ========================================
// CONSULTAR TODOS LOS USUARIOS
// ========================================

const getUsuarios = async (req, res) => {
  try {

    const usuarios = await Usuario
      .find()
      .select('-password');

    res.json(usuarios);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al obtener usuarios'
    });
  }
};


// ========================================
// BUSCAR USUARIO POR NOMBRE
// ========================================

const buscarUsuarioPorNombre = async (req, res) => {
  try {

    const { nombre } = req.params;

    const usuarios = await Usuario.find({
      nombre: {
        $regex: nombre,
        $options: 'i'
      }
    }).select('-password');

    res.json(usuarios);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al buscar usuario'
    });
  }
};


// ========================================
// ELIMINAR USUARIO
// ========================================

const deleteUsuario = async (req, res) => {
  try {

    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      message: 'Usuario eliminado correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al eliminar usuario'
    });
  }
};


// ========================================
// LOGIN
// ========================================

const login = async (req, res) => {
  try {

    const { usuario, password } = req.body;

    // Validar campos
    if (!usuario || !password) {
      return res.status(400).json({
        error: 'Usuario y contraseña son obligatorios'
      });
    }

    // Buscar usuario incluyendo password
    const usuarioEncontrado = await Usuario
      .findOne({ usuario })
      .select('+password');

    if (!usuarioEncontrado) {
      return res.status(401).json({
        error: 'Usuario o contraseña incorrectos'
      });
    }

    // Comparar contraseña
    const passwordCorrecta = await bcrypt.compare(
      password,
      usuarioEncontrado.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: 'Usuario o contraseña incorrectos'
      });
    }

    // Crear JWT
    const token = jwt.sign(
      {
        id: usuarioEncontrado._id,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5h'
      }
    );

    // Respuesta
    res.json({
      message: 'Inicio de sesión correcto',

      token,

      usuario: {
        id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
};
// ========================================
// CAMBIAR CONTRASEÑA
// ========================================

const cambiarPassword = async (req, res) => {
  try {

    const { usuario, passwordActual, passwordNueva } = req.body;

    // Validar campos
    if (!usuario || !passwordActual || !passwordNueva) {
      return res.status(400).json({
        error: 'Usuario, contraseña actual y contraseña nueva son obligatorios'
      });
    }

    // Validar longitud de nueva contraseña
    if (passwordNueva.length < 8) {
      return res.status(400).json({
        error: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }

    // Buscar usuario incluyendo password
    const usuarioEncontrado = await Usuario
      .findOne({ usuario })
      .select('+password');

    if (!usuarioEncontrado) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Comprobar contraseña actual
    const passwordCorrecta = await bcrypt.compare(
      passwordActual,
      usuarioEncontrado.password
    );

    if (!passwordCorrecta) {
      return res.status(401).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Evitar que la nueva contraseña sea igual a la anterior
    const mismaPassword = await bcrypt.compare(
      passwordNueva,
      usuarioEncontrado.password
    );

    if (mismaPassword) {
      return res.status(400).json({
        error: 'La nueva contraseña debe ser diferente a la actual'
      });
    }

    // Encriptar nueva contraseña
    const passwordHash = await bcrypt.hash(passwordNueva, 12);

    // Guardar nueva contraseña
    usuarioEncontrado.password = passwordHash;

    await usuarioEncontrado.save();

    res.json({
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Error al cambiar contraseña'
    });
  }
};

module.exports = {
  createUsuario,
  getUsuarios,
  buscarUsuarioPorNombre,
  deleteUsuario,
  login,
  cambiarPassword
};