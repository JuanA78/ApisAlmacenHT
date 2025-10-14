const Movimiento = require('../models/Movimiento');
const Producto = require('../models/Productos');

// Registrar entrada
const registrarEntrada = async (req, res) => {
  const { productoId, cantidad, fecha } = req.body;
  try {
    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    const movimiento = new Movimiento({
      productoId,
      NombreProducto: producto.NombreProducto,
      NoParte: producto.NoParte,
      tipo: 'Entrada',
      cantidad,
      fecha
    });
    await movimiento.save();

    producto.Existencia += cantidad;
    await producto.save();

    res.status(201).json({ message: 'Entrada registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar entrada', error });
  }
};

// Registrar salida
const registrarSalida = async (req, res) => {
  const { productoId, cantidad, fecha, cliente, estatus } = req.body;
  try {
    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    if (producto.Existencia < cantidad) return res.status(400).json({ message: 'Cantidad insuficiente en existencia' });

    const movimiento = new Movimiento({
      productoId,
      NombreProducto: producto.NombreProducto,
      NoParte: producto.NoParte,
      tipo: 'Salida',
      cantidad,
      fecha,
      precio: producto.PrecioVenta,
      nombreCliente: cliente || "Sin nombre",
      estatus: estatus || "Activo"
    });

    await movimiento.save();
    producto.Existencia -= cantidad;
    await producto.save();

    res.status(201).json({ message: 'Salida registrada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar salida', error });
  }
};

// Obtener todos los movimientos
const getMovimientos = async (req, res) => {
  try {
    const movimientos = await Movimiento.find().sort({ fecha: -1 });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener movimientos', error });
  }
};

// Eliminar todos los movimientos
const deleteMovimientos = async (req, res) => {
  try {
    await Movimiento.deleteMany({});
    res.status(200).json({ message: 'Todos los movimientos han sido eliminados' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar movimientos', error });
  }
};

// Actualizar estatus de un movimiento
const updateEstatusMovimiento = async (req, res) => {
  const { estatus } = req.body;
  const estatusValidos = ['Pagado', 'Pendiente', 'No Pagado', 'Activo'];
  if (!estatusValidos.includes(estatus)) return res.status(400).json({ message: 'Estatus no válido' });

  try {
    const movimiento = await Movimiento.findByIdAndUpdate(req.params.id, { estatus }, { new: true });
    if (!movimiento) return res.status(404).json({ message: 'Movimiento no encontrado' });

    res.json({ message: 'Estatus actualizado correctamente', movimiento });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar estatus', error });
  }
};

module.exports = {
  registrarEntrada,
  registrarSalida,
  getMovimientos,
  deleteMovimientos,
  updateEstatusMovimiento
};
