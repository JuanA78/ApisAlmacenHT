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

// Actualizar precio de venta
const updatePrecioProducto = async (req, res) => {
  const { id } = req.params;
  const { nuevoPrecioVenta } = req.body;

  try {
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    if (nuevoPrecioVenta !== undefined) {
      producto.PrecioVenta = nuevoPrecioVenta;
    }

    await producto.save();
    res.status(200).json({ message: 'Precio actualizado', producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto
const deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProductos,
  createProducto,
  getProductoByCodigoBarras,
  updatePrecioProducto,
  deleteProducto
};
