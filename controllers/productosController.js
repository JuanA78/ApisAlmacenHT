const Producto = require('../models/Productos');
const Auditoria = require('../models/Auditoria');

// Obtener productos paginados de 50 en 50 (con Búsqueda, Filtros y Ordenamiento)
const getProductos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Extraer parámetros de búsqueda y orden de la URL
    const { search, estante, marca, proveedor, sortBy, sortOrder } = req.query;

    // Construcción del objeto de filtro para Mongoose
    let filter = {};

    // 1. Búsqueda flexible (search) por Nombre, Proveedor o Marca
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i'); // 'i' para insensible a mayúsculas/minúsculas
      filter.$or = [
        { NombreProducto: regex },
        { Proveedor: regex },
        { Marca: regex },
        { NoParte: regex }
      ];
    }

    if (marca && marca.trim() !== '') {
      filter.Marca = new RegExp(marca.trim(), 'i');
    }

    if (proveedor && proveedor.trim() !== '') {
      filter.Proveedor = new RegExp(proveedor.trim(), 'i');
    }

    if (estante && estante.trim() !== '') {
      filter.Estante = new RegExp(estante.trim(), 'i');
    }

    // 2. Configuración del Ordenamiento (Abecedario A-Z/Z-A o Estante)
    let sortOptions = {};
    const order = sortOrder === 'desc' ? -1 : 1; // 1 = A-Z (Ascendente), -1 = Z-A (Descendente)

    if (sortBy === 'estante') {
      sortOptions = { Estante: order, NombreProducto: 1 };
    } else {
      // Por defecto o si piden por abecedario/nombre
      sortOptions = { NombreProducto: order };
    }

    // Ejecutamos la consulta y el conteo en paralelo aplicando el filtro y el ordenamiento
    const [productos, total] = await Promise.all([
      Producto.find(filter)
        .sort(sortOptions)    // <-- Aplica el ordenamiento aquí
        .lean()               // Desconecta métodos pesados de Mongoose
        .skip(skip)           // Salta los productos de páginas anteriores
        .limit(limit),        // Carga exactamente el límite (50 por defecto)
      Producto.countDocuments(filter) // Cuenta el total respetando el filtro
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      totalProductos: total,
      paginaActual: page,
      totalPaginas: totalPages,
      productosPorPagina: productos.length,
      data: productos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear producto
const createProducto = async (req, res) => {
  try {
  const nuevoProducto = new Producto(req.body);

    await nuevoProducto.save();

    await Auditoria.create({
      usuarioId: req.usuario.id,
      usuario: req.usuario.usuario,
      rol: req.usuario.rol,
      accion: 'CREAR',
      modulo: 'PRODUCTOS',
      descripcion: `Se creó el producto ${nuevoProducto.NombreProducto}, No. Parte: ${nuevoProducto.NoParte}`
    });

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

await Auditoria.create({
  usuarioId: req.usuario.id,
  usuario: req.usuario.usuario,
  rol: req.usuario.rol,
  accion: 'ACTUALIZAR_PRECIO',
  modulo: 'PRODUCTOS',
  descripcion: `Se actualizó el precio del producto ${producto.NombreProducto} a $${producto.PrecioVenta}`
});

res.status(200).json({
  message: 'Precio actualizado',
  producto
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto
const deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

      await Auditoria.create({
      usuarioId: req.usuario.id,
      usuario: req.usuario.usuario,
      rol: req.usuario.rol,
      accion: 'ELIMINAR',
      modulo: 'PRODUCTOS',
      descripcion: `Se eliminó el producto ${producto.NombreProducto}, No. Parte: ${producto.NoParte}`
    });
    res.json({ message: 'Producto eliminado', producto });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Actualizar TODO el producto
const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      req.body, 
      {
        new: true, 
        runValidators: true 
      }
    );

    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await Auditoria.create({
  usuarioId: req.usuario.id,
  usuario: req.usuario.usuario,
  rol: req.usuario.rol,
  accion: 'ACTUALIZAR',
  modulo: 'PRODUCTOS',
  descripcion: `Se actualizó el producto ${productoActualizado.NombreProducto}, No. Parte: ${productoActualizado.NoParte}`
});

    res.status(200).json({
      message: 'Producto actualizado correctamente',
      producto: productoActualizado
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Buscar productos por marca
const getProductosByMarca = async (req, res) => {
  try {
    const { marca } = req.params;

    const productos = await Producto.find({
      Marca: { $regex: marca, $options: 'i' } // 🔥 búsqueda flexible (case insensitive)
    });

    if (productos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron productos con esa marca' });
    }

    res.json(productos);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  getProductos,
  createProducto,
  getProductoByCodigoBarras,
  updatePrecioProducto,
  deleteProducto,
  updateProducto,
  getProductosByMarca
};
