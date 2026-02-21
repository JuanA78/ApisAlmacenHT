const Producto = require('../models/Productos');
const LotesCompra = require('../models/Entradas');

/**
 * REGISTRAR ENTRADA
 */
const registrarCompra = async (req, res) => {
  const {
    NoParte,
    FolioCompra,
    Cantidad,
    PrecioCompra
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
      PrecioCompra
    });

    await lote.save();

    producto.ExistenciaTotal += Cantidad;
    await producto.save();

    res.status(201).json({
      message: 'Entrada registrada correctamente',
      lote
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER TODAS LAS ENTRADAS
 */
const getEntradas = async (req, res) => {
  try {
    const entradas = await LotesCompra.find()
      .populate('producto', 'NombreProducto NoParte')
      .sort({ FechaCompra: 1 }); // FIFO

    res.json(entradas);
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

    await entrada.deleteOne();

    res.json({ message: 'Lote eliminado correctamente' });
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
