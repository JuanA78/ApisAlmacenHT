const Producto = require('../models/Productos');
const LotesCompra = require('../models/Entradas');
const Auditoria = require('../models/Auditoria');

/**
 * REGISTRAR ENTRADA
 */
const registrarCompra = async (req, res) => {
  const {
    NoParte,
    FolioCompra,
    Cantidad,
    PrecioCompra,
    FechaCompra
  } = req.body;

  try {
    const producto = await Producto.findOne({ NoParte });

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const lote = new LotesCompra({
      producto: producto._id,
      FolioCompra,
      CantidadInicial: Cantidad,
      CantidadDisponible: Cantidad,
      PrecioCompra,
      FechaCompra: FechaCompra
    });

    await lote.save();

    producto.ExistenciaTotal += Cantidad;
    await producto.save();

   await Auditoria.create({
    usuarioId: req.usuario.id,
    usuario: req.usuario.usuario,
    rol: req.usuario.rol,
    accion: 'CREAR',
    modulo: 'ENTRADAS',
    descripcion: `Se registró una entrada de ${Cantidad} unidades del producto ${producto.NombreProducto}, folio ${FolioCompra}`
});

res.status(201).json({
    message: 'Entrada registrada correctamente',
    lote
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER TODAS LAS ENTRADAS (Con Paginación, Filtro por Nombre y Orden Descendente)
 */
const getEntradas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Por defecto 100 por página
    const skip = (page - 1) * limit;

    const { nombre } = req.query;

    let matchProducto = {};

    // Si envían un nombre, buscamos los IDs de los productos que coincidan
    if (nombre && nombre.trim() !== '') {
      const regex = new RegExp(nombre.trim(), 'i');
      const productosCoincidentes = await Producto.find({ NombreProducto: regex }).select('_id');
      const idsProductos = productosCoincidentes.map(p => p._id);

      matchProducto = { producto: { $in: idsProductos } };
    }

    // Ejecutamos la consulta y el conteo en paralelo
    const [entradas, total] = await Promise.all([
      LotesCompra.find(matchProducto)
        .populate('producto', 'NombreProducto NoParte')
        .sort({ FechaCompra: -1, _id: -1 }) // -1 Ordena de la MÁS RECIENTE a la MÁS ANTIGUA
        .skip(skip)
        .limit(limit)
        .lean(),
      LotesCompra.countDocuments(matchProducto)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      totalEntradas: total,
      paginaActual: page,
      totalPaginas: totalPages,
      entradasPorPagina: entradas.length,
      data: entradas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/**
 * OBTENER ENTRADA POR ID
 */
const getEntradaById = async (req, res) => {
  try {
    const entrada = await LotesCompra.findById(req.params.id)
      .populate('producto', 'NombreProducto NoParte');

    if (!entrada) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    res.json(entrada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ELIMINAR ENTRADA POR ID
 * SOLO SI CantidadDisponible === 0
 */
const deleteEntradaById = async (req, res) => {
  try {
    const entrada = await LotesCompra.findById(req.params.id);

    if (!entrada) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    if (entrada.CantidadDisponible > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar un lote con cantidad disponible'
      });
    }


const folioCompra = entrada.FolioCompra;
const cantidad = entrada.CantidadInicial;

await entrada.deleteOne();

await Auditoria.create({
    usuarioId: req.usuario.id,
    usuario: req.usuario.usuario,
    rol: req.usuario.rol,
    accion: 'ELIMINAR',
    modulo: 'ENTRADAS',
    descripcion: `Se eliminó una entrada con folio ${folioCompra} y cantidad inicial de ${cantidad} unidades`
});

res.json({
    message: 'Lote eliminado correctamente'
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registrarCompra,
  getEntradas,
  getEntradaById,
  deleteEntradaById
};
