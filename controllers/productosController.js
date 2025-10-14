const Producto = require('../models/Productos');

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear producto
const createProducto = async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Buscar por código de barras
const getProductoByCodigoBarras = async (req, res) => {
  try {
    const producto = await Producto.findOne({ CodigoBarras: req.params.codigo });
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar precios
const updatePrecioProducto = async (req, res) => {
  const { id } = req.params;
  const { nuevoPrecioVenta, nuevoPrecioCompra } = req.body;

  try {
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    if (nuevoPrecioVenta !== undefined) producto.PrecioVenta = nuevoPrecioVenta;
    if (nuevoPrecioCompra !== undefined) producto.PrecioCompra = nuevoPrecioCompra;

    await producto.save();

    res.status(200).json({ message: 'Precios actualizados correctamente', producto });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar los precios', error: error.message });
  }
};

// ✅ Eliminar producto por ID
const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findByIdAndDelete(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json({ message: 'Producto eliminado correctamente', producto });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

module.exports = {
  getProductos,
  createProducto,
  getProductoByCodigoBarras,
  updatePrecioProducto,
  deleteProducto
};
