const mongoose = require('mongoose');
const Salida = require('../models/Salidas');
const Producto = require('../models/Productos');
const Contador = require('../models/Contador');
const LotesCompra = require('../models/Entradas');
const Cliente = require('../models/Cliente');

/**
 * ➕ Crear salida (venta)
 */
const crearSalida = async (req, res) => {
  const {
    Cliente: nombreCliente,
    ClienteEmpresa,
    FechaSalida,
    EstatusPago,
    TipoVenta,
    Productos
  } = req.body;

  if (!Productos || Productos.length === 0) {
    return res.status(400).json({
      message: 'Debe agregar al menos un producto'
    });
  }

  if (!['PUBLICO', 'INTERNA'].includes(TipoVenta)) {
    return res.status(400).json({
      message: 'Tipo de venta inválido'
    });
  }

  // 🔐 VALIDACIONES POR TIPO DE VENTA
  if (TipoVenta === 'INTERNA' && !ClienteEmpresa) {
    return res.status(400).json({
      message: 'ClienteEmpresa es obligatorio para ventas internas'
    });
  }

  if (TipoVenta === 'PUBLICO' && !nombreCliente) {
    return res.status(400).json({
      message: 'El nombre del cliente es obligatorio para público'
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 🔍 Si es interna, validar que el cliente exista
    let clienteNombreFinal = nombreCliente;

    if (TipoVenta === 'INTERNA') {
  const clienteDB = await Cliente
    .findById(ClienteEmpresa)
    .populate('empresa')
    .session(session);

  if (!clienteDB) {
    throw new Error('Cliente interno no encontrado');
  }

  clienteNombreFinal = `${clienteDB.operador} - ${clienteDB.unidad}`;
    }

    // 🔢 Folio persistente
    let contador = await Contador.findOne({ nombre: 'salidas' }).session(session);

    if (!contador) {
      contador = new Contador({ nombre: 'salidas', valor: 0 });
    }

    contador.valor += 1;
    await contador.save({ session });

    const nuevoFolio = contador.valor;
    const productosSalida = [];

    // 📦 Procesar productos
    for (const item of Productos) {
      
      const producto = await Producto.findById(item.producto).session(session);



      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (producto.ExistenciaTotal < item.Cantidad) {
        throw new Error(`Stock insuficiente para ${producto.NombreProducto}`);
      }

      let cantidadPendiente = item.Cantidad;

      const lotes = await LotesCompra.find({
        producto: producto._id,
        CantidadDisponible: { $gt: 0 }
      })
        .sort({ FechaCompra: 1 })
        .session(session);

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) break;

        const descontar = Math.min(lote.CantidadDisponible, cantidadPendiente);
        lote.CantidadDisponible -= descontar;
        cantidadPendiente -= descontar;

        await lote.save({ session });
      }

      producto.ExistenciaTotal -= item.Cantidad;
      await producto.save({ session });

      productosSalida.push({
        producto: producto._id,
        NombreProducto: producto.NombreProducto,
        NoParte: producto.NoParte,
        Cantidad: item.Cantidad,
        PrecioVenta: item.PrecioVenta
      });
    }

    // 🧾 Crear salida
    const salida = new Salida({
      FolioSalida: nuevoFolio,
      Cliente: clienteNombreFinal,
      ClienteEmpresa: TipoVenta === 'INTERNA' ? ClienteEmpresa : null,
      TipoVenta,
      EstatusPago,
      Productos: productosSalida
    });

    await salida.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Salida registrada correctamente',
      salida
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: 'Error al crear la salida',
      error: error.message
    });
  }
};

/**
 * 📄 Obtener TODAS las salidas
 */
const obtenerTodasSalidas = async (req, res) => {
  try {
    const salidas = await Salida.find()
      .populate('ClienteEmpresa', 'nombre rfc')
      .populate('Productos.producto', 'NombreProducto NoParte')
      .sort({ FolioSalida: -1 });

    res.json(salidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📄 Obtener SOLO salidas NO pagadas
 */
const obtenerSalidas = async (req, res) => {
  try {
    const salidas = await Salida.find({
      EstatusPago: { $ne: 'PAGADO' }
    })
      .populate('ClienteEmpresa', 'nombre rfc')
      .populate('Productos.producto', 'NombreProducto NoParte')
      .sort({ FolioSalida: -1 });

    res.json(salidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔄 Actualizar estatus de pago
 */
const actualizarEstatusPago = async (req, res) => {
  try {
    const { EstatusPago } = req.body;

    if (!['PAGADO', 'NO PAGADO', 'PENDIENTE'].includes(EstatusPago)) {
      return res.status(400).json({
        message: 'Estatus de pago inválido'
      });
    }

    const salida = await Salida.findByIdAndUpdate(
      req.params.id,
      { EstatusPago },
      { new: true }
    );

    if (!salida) {
      return res.status(404).json({
        message: 'Salida no encontrada'
      });
    }

    res.json(salida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ❌ Eliminar SOLO salidas PAGADAS
 */
const eliminarSalidasPagadas = async (req, res) => {
  try {
    const resultado = await Salida.deleteMany({
      EstatusPago: 'PAGADO'
    });

    res.json({
      message: 'Salidas pagadas eliminadas correctamente',
      eliminadas: resultado.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// 📦 Obtener productos vendidos a un cliente interno
const obtenerProductosPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const salidas = await Salida.find({
      ClienteEmpresa: clienteId
    })
    .populate('Productos.producto', 'NombreProducto NoParte')
    .sort({ FechaSalida: -1 });

    res.json(salidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  crearSalida,
  obtenerTodasSalidas,
  obtenerSalidas,
  actualizarEstatusPago,
  eliminarSalidasPagadas,
  obtenerProductosPorCliente
};
