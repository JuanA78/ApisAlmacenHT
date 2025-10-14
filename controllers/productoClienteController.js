const ProductoCliente = require('../models/ProductoCliente');
const Producto = require('../models/Productos');
const Movimiento = require('../models/Movimiento');

// Asignar producto a cliente
const asignarProducto = async (req, res) => {
  const { clienteId, productoId, nombreProducto, noParte, cantidad, precio, fecha, nombreCliente, estatus } = req.body;
  try {
    const producto = await Producto.findById(productoId);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    if (producto.Existencia < cantidad) return res.status(400).json({ message: 'Existencia insuficiente' });

    const asignacion = new ProductoCliente({ clienteId, productoId, nombreProducto, noParte, precio, cantidad, fecha, nombreCliente });
    await asignacion.save();

    producto.Existencia -= cantidad;
    await producto.save();

    await Movimiento.create({
      productoId: producto._id,
      NombreProducto: producto.NombreProducto,
      NoParte: producto.NoParte,
      tipo: 'Salida',
      fecha,
      cantidad,
      precio: producto.PrecioVenta,
      nombreCliente: nombreCliente || "Sin nombre",
      estatus: estatus || "Activo"
    });

    res.status(201).json({ message: 'Producto asignado y existencia actualizada', asignacion });
  } catch (error) {
    res.status(500).json({ message: 'Error interno, puede faltar un dato', error: error.message });
  }
};

// Obtener todos los productos asignados
const getProductosCliente = async (req, res) => {
  try {
    const asignaciones = await ProductoCliente.find().sort({ fecha: -1 });
    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asignaciones', error: error.message });
  }
};

// Obtener productos por cliente
const getProductosPorCliente = async (req, res) => {
  try {
    const asignaciones = await ProductoCliente.find({ clienteId: req.params.clienteId }).sort({ fecha: -1 });
    res.status(200).json(asignaciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener asignaciones del cliente', error: error.message });
  }
};

// Eliminar productos por cliente
const deleteProductosPorCliente = async (req, res) => {
  try {
    await ProductoCliente.deleteMany({ clienteId: req.params.clienteId });
    res.status(200).json({ message: 'Productos eliminados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar productos del cliente' });
  }
};

module.exports = {
  asignarProducto,
  getProductosCliente,
  getProductosPorCliente,
  deleteProductosPorCliente
};
