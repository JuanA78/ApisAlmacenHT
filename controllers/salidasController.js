const mongoose = require('mongoose');
const Salida = require('../models/Salidas');
const Producto = require('../models/Productos');
const Contador = require('../models/Contador');
const LotesCompra = require('../models/Entradas');
const Cliente = require('../models/Cliente');
const Auditoria = require('../models/Auditoria');

//////////////////////////////////////////////////////
// ➕ CREAR SALIDA
//////////////////////////////////////////////////////
const crearSalida = async (req, res) => {
  const {
    Cliente: nombreCliente,
    ClienteEmpresa,
    EstatusPago,
    TipoVenta,
    Productos,
    FechaSalida,
    Descuento 
  } = req.body;

  if (!Productos || Productos.length === 0) {
    return res.status(400).json({ message: 'Debe agregar productos' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {

    let clienteNombreFinal = nombreCliente;

    if (TipoVenta === 'INTERNA') {
      const clienteDB = await Cliente.findById(ClienteEmpresa).session(session);
      if (!clienteDB) throw new Error('Cliente interno no encontrado');
      clienteNombreFinal = `${clienteDB.operador} - ${clienteDB.unidad}`;
    }

    let contador = await Contador.findOne({ nombre: 'salidas' }).session(session);
    if (!contador) contador = new Contador({ nombre: 'salidas', valor: 0 });

    contador.valor += 1;
    await contador.save({ session });

    const productosSalida = [];

    for (const item of Productos) {

      const producto = await Producto.findById(item.producto).session(session);
      if (!producto) throw new Error('Producto no encontrado');

      if (producto.ExistenciaTotal < item.CantidadVendida) {
        throw new Error(`Stock insuficiente para ${producto.NombreProducto}`);
      }

      let cantidadPendiente = item.CantidadVendida;
      let lotesUtilizados = [];

      const lotes = await LotesCompra.find({
        producto: producto._id,
        CantidadDisponible: { $gt: 0 }
      }).sort({ FechaCompra: 1 }).session(session);

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) break;

        const descontar = Math.min(lote.CantidadDisponible, cantidadPendiente);

        lote.CantidadDisponible -= descontar;
        await lote.save({ session });

        lotesUtilizados.push({
          loteId: lote._id,
          cantidad: descontar,
          devuelto: 0
        });

        cantidadPendiente -= descontar;
      }

      producto.ExistenciaTotal -= item.CantidadVendida;
      await producto.save({ session });

      productosSalida.push({
        producto: producto._id,
        NombreProducto: producto.NombreProducto,
        NoParte: producto.NoParte,
        CantidadVendida: item.CantidadVendida,
        CantidadDevuelta: 0,
        Estado: 'ACTIVO',
        PrecioVenta: item.PrecioVenta,
        LotesDescontados: lotesUtilizados
      });
    }

    const salida = new Salida({
      FolioSalida: contador.valor,
      Cliente: clienteNombreFinal,
      ClienteEmpresa: TipoVenta === 'INTERNA' ? ClienteEmpresa : null,
      TipoVenta,
      EstatusPago,
      Productos: productosSalida,
      FechaSalida: FechaSalida || new Date(),
        Descuento: Number(Descuento) || 0
    });

    await salida.save({ session });

    await Auditoria.create([{
  usuarioId: req.usuario.id,
  usuario: req.usuario.usuario,
  rol: req.usuario.rol,
  accion: 'CREAR',
  modulo: 'SALIDAS',
  descripcion: `Se creó la salida con folio ${salida.FolioSalida} para el cliente ${salida.Cliente}, con ${salida.Productos.length} producto(s)`
}], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(salida);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// 🔄 DEVOLVER PRODUCTO (CON LOGS DETALLADOS)
//////////////////////////////////////////////////////
const devolverProducto = async (req, res) => {
  const { salidaId, productoId, cantidadADevolver } = req.body;
  
  console.log('=================================');
  console.log('SOLICITUD DE DEVOLUCIÓN RECIBIDA');
  console.log('=================================');
  console.log('Body recibido:', { salidaId, productoId, cantidadADevolver });
  console.log('Tipo de salidaId:', typeof salidaId);
  console.log('Tipo de productoId:', typeof productoId);
  console.log('Tipo de cantidad:', typeof cantidadADevolver);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // PASO 1: Buscar la salida
    console.log('PASO 1 - Buscando salida con ID:', salidaId);
    const salida = await Salida.findById(salidaId).session(session);
    
    if (!salida) {
      console.log('ERROR: Salida no encontrada con ID:', salidaId);
      throw new Error('Salida no encontrada');
    }
    
    console.log('Salida encontrada:');
    console.log('- Folio:', salida.FolioSalida);
    console.log('- Cliente:', salida.Cliente);
    console.log('- Estatus Pago:', salida.EstatusPago);
    console.log('- Total productos:', salida.Productos.length);
    
    // PASO 2: Verificar estatus de pago
    console.log('PASO 2 - Verificando estatus de pago');
    if (salida.EstatusPago === 'PAGADO') {
      console.log('ERROR: Intento de devolución en salida pagada');
      throw new Error('No se puede devolver una salida pagada');
    }
    
    // PASO 3: Buscar el producto en la salida
    console.log('PASO 3 - Buscando producto en la salida');
    console.log('ProductoId buscado:', productoId);
    
    // Mostrar todos los productos disponibles para depuración
    console.log('Productos disponibles en la salida:');
    salida.Productos.forEach((p, index) => {
      console.log(`  Producto ${index + 1}:`);
      console.log(`    - _id del subdocumento: ${p._id}`);
      console.log(`    - producto (referencia): ${p.producto}`);
      console.log(`    - Nombre: ${p.NombreProducto}`);
      console.log(`    - CantidadVendida: ${p.CantidadVendida}`);
      console.log(`    - CantidadDevuelta: ${p.CantidadDevuelta}`);
    });
    
    // Buscar por el campo 'producto' (que es la referencia al producto original)
    const productoSalida = salida.Productos.find(
      p => p.producto && p.producto.toString() === productoId
    );
    
    if (!productoSalida) {
      console.log('ERROR: Producto no encontrado en la salida');
      console.log('ProductoId buscado:', productoId);
      console.log('Productos disponibles (solo referencias):', 
        salida.Productos.map(p => p.producto?.toString()));
      throw new Error('Producto no existe en esta salida');
    }
    
    console.log('Producto encontrado en la salida:');
    console.log('  - _id del subdocumento:', productoSalida._id);
    console.log('  - producto (referencia):', productoSalida.producto);
    console.log('  - Nombre:', productoSalida.NombreProducto);
    console.log('  - CantidadVendida:', productoSalida.CantidadVendida);
    console.log('  - CantidadDevuelta:', productoSalida.CantidadDevuelta);
    console.log('  - Estado actual:', productoSalida.Estado);
    console.log('  - Lotes descontados:', productoSalida.LotesDescontados?.length || 0);
    
    // PASO 4: Verificar cantidad disponible
    console.log('PASO 4 - Verificando cantidad disponible');
    const disponible = productoSalida.CantidadVendida - productoSalida.CantidadDevuelta;
    console.log('Cantidad vendida:', productoSalida.CantidadVendida);
    console.log('Cantidad devuelta:', productoSalida.CantidadDevuelta);
    console.log('Disponible para devolver:', disponible);
    console.log('Cantidad solicitada:', cantidadADevolver);
    
    if (cantidadADevolver > disponible) {
      console.log('ERROR: Cantidad solicitada excede lo disponible');
      throw new Error(`Cantidad mayor a la disponible para devolución. Disponible: ${disponible}`);
    }
    
    // PASO 5: Procesar devolución por lotes
    console.log('PASO 5 - Procesando devolución por lotes');
    let cantidadPendiente = cantidadADevolver;
    let lotesProcesados = 0;
    
    for (const loteInfo of productoSalida.LotesDescontados) {
      if (cantidadPendiente <= 0) {
        console.log('Cantidad pendiente cubierta, deteniendo procesamiento de lotes');
        break;
      }
      
      lotesProcesados++;
      console.log(`Procesando lote ${lotesProcesados}:`);
      console.log('  - loteId:', loteInfo.loteId);
      console.log('  - cantidad original del lote:', loteInfo.cantidad);
      console.log('  - devuelto actual:', loteInfo.devuelto || 0);
      
      const lote = await LotesCompra.findById(loteInfo.loteId).session(session);
      
      if (!lote) {
        console.log('  - ADVERTENCIA: Lote no encontrado, continuando con siguiente');
        continue;
      }
      
      console.log('  - Lote encontrado en BD:');
      console.log('    - Producto:', lote.producto);
      console.log('    - Cantidad disponible actual:', lote.CantidadDisponible);
      
      const disponibleEnLote = loteInfo.cantidad - (loteInfo.devuelto || 0);
      console.log('  - Disponible en este lote:', disponibleEnLote);
      
      const devolverAqui = Math.min(disponibleEnLote, cantidadPendiente);
      console.log('  - Devolviendo de este lote:', devolverAqui);
      
      lote.CantidadDisponible += devolverAqui;
      await lote.save({ session });
      console.log('  - Lote actualizado, nueva cantidad disponible:', lote.CantidadDisponible);
      
      loteInfo.devuelto = (loteInfo.devuelto || 0) + devolverAqui;
      console.log('  - devuelto actualizado en loteInfo:', loteInfo.devuelto);
      
      cantidadPendiente -= devolverAqui;
      console.log('  - Cantidad pendiente después de este lote:', cantidadPendiente);
    }
    
    // PASO 6: Actualizar producto principal
    console.log('PASO 6 - Actualizando producto principal');
    console.log('Buscando producto en BD con ID:', productoSalida.producto);
    
    const productoDB = await Producto.findById(productoSalida.producto).session(session);
    
    if (!productoDB) {
      console.log('ERROR: Producto no encontrado en colección productos');
      throw new Error('Producto no encontrado en inventario');
    }
    
    console.log('Producto encontrado en BD:');
    console.log('  - Nombre:', productoDB.NombreProducto);
    console.log('  - Existencia actual:', productoDB.ExistenciaTotal);
    
    productoDB.ExistenciaTotal += cantidadADevolver;
    await productoDB.save({ session });
    
    console.log('  - Existencia actualizada:', productoDB.ExistenciaTotal);
    
    // PASO 7: Actualizar el producto en la salida
    console.log('PASO 7 - Actualizando registro en la salida');
    productoSalida.CantidadDevuelta += cantidadADevolver;
    
    console.log('CantidadDevuelta actualizada:', productoSalida.CantidadDevuelta);
    
    if (productoSalida.CantidadDevuelta === productoSalida.CantidadVendida) {
      productoSalida.Estado = 'DEVUELTO';
      console.log('Estado actualizado a: DEVUELTO');
    } else {
      productoSalida.Estado = 'PARCIAL';
      console.log('Estado actualizado a: PARCIAL');
    }
    
    // PASO 8: Guardar la salida
    console.log('PASO 8 - Guardando salida actualizada');
    await salida.save({ session });

await salida.save({ session });

  await Auditoria.create([{
    usuarioId: req.usuario.id,
    usuario: req.usuario.usuario,
    rol: req.usuario.rol,
    accion: 'DEVOLVER',
    modulo: 'SALIDAS',
    descripcion: `Se devolvieron ${cantidadADevolver} unidad(es) del producto ${productoSalida.NombreProducto} en la salida con folio ${salida.FolioSalida}`
  }], { session });



    console.log('Salida guardada exitosamente');
    
    // PASO 9: Confirmar transacción
    console.log('PASO 9 - Confirmando transacción');
    await session.commitTransaction();
    session.endSession();
    
    console.log('=================================');
    console.log('✅ DEVOLUCIÓN EXITOSA');
    console.log('=================================');
    
    res.json({ 
      message: 'Devolución realizada correctamente',
      cantidadDevuelta: cantidadADevolver,
      nuevoEstado: productoSalida.Estado
    });

  } catch (error) {
    console.log('=================================');
    console.log('❌ ERROR EN DEVOLUCIÓN');
    console.log('=================================');
    console.log('Mensaje de error:', error.message);
    console.log('Stack trace:', error.stack);
    
    await session.abortTransaction();
    session.endSession();
    
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
};
//////////////////////////////////////////////////////
// 📄 OBTENER TODAS (PAGINADO, FILTRADO Y ORDENADO POR FOLIO MAYOR -> MENOR)
//////////////////////////////////////////////////////
const obtenerTodasSalidas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const clienteFiltro = req.query.cliente ? req.query.cliente.trim() : '';

    const skip = (page - 1) * limit;

    // Construcción del pipeline de Agregación
    const pipeline = [];

    // Si viene término de búsqueda por Cliente (insensible a mayúsculas/minúsculas)
    if (clienteFiltro) {
      pipeline.push({
        $match: {
          Cliente: { $regex: clienteFiltro, $options: 'i' }
        }
      });
    }

    // Facet para contar total y traer la página actual de un solo golpe
    pipeline.push({
      $facet: {
        totalData: [
          { $count: 'total' }
        ],
        paginatedResults: [
          { $sort: { FolioSalida: -1 } }, // Mayor a menor por Folio
          { $skip: skip },
          { $limit: limit },

          // Populate de ClienteEmpresa
          {
            $lookup: {
              from: 'clientes', // Nombre de la colección en BD
              localField: 'ClienteEmpresa',
              foreignField: '_id',
              as: 'ClienteEmpresaInfo'
            }
          },
          {
            $unwind: {
              path: '$ClienteEmpresaInfo',
              preserveNullAndEmptyArrays: true
            }
          },

          // Populate de la Empresa dentro de ClienteEmpresa
          {
            $lookup: {
              from: 'empresas',
              localField: 'ClienteEmpresaInfo.empresa',
              foreignField: '_id',
              as: 'ClienteEmpresaInfo.empresa'
            }
          },
          {
            $unwind: {
              path: '$ClienteEmpresaInfo.empresa',
              preserveNullAndEmptyArrays: true
            }
          },

          // Populate de la lista de productos dentro de la salida
          {
            $unwind: {
              path: '$Productos',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'productos',
              localField: 'Productos.producto',
              foreignField: '_id',
              as: 'Productos.productoInfo'
            }
          },
          {
            $unwind: {
              path: '$Productos.productoInfo',
              preserveNullAndEmptyArrays: true
            }
          },
          // Reestructuración para simular la propiedad "producto" populada
          {
            $addFields: {
              'Productos.producto': '$Productos.productoInfo'
            }
          },
          // Reagrupar los productos por Salida
          {
            $group: {
              _id: '$_id',
              FolioSalida: { $first: '$FolioSalida' },
              Cliente: { $first: '$Cliente' },
              ClienteEmpresa: { $first: '$ClienteEmpresaInfo' },
              TipoVenta: { $first: '$TipoVenta' },
              EstatusPago: { $first: '$EstatusPago' },
              Descuento: { $first: '$Descuento' },
              Productos: { $push: '$Productos' },
              FechaSalida: { $first: '$FechaSalida' },
              createdAt: { $first: '$createdAt' },
              updatedAt: { $first: '$updatedAt' }
            }
          },

          // Asegurar de nuevo el orden descendente tras el $group
          { $sort: { FolioSalida: -1 } }
        ]
      }
    });

    const result = await Salida.aggregate(pipeline);

    const totalSalidas = result[0].totalData[0] ? result[0].totalData[0].total : 0;
    const salidas = result[0].paginatedResults || [];
    const totalPaginas = Math.ceil(totalSalidas / limit);

    res.json({
      totalSalidas,
      totalPaginas,
      paginaActual: page,
      limitePorPagina: limit,
      data: salidas
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// 📄 SOLO NO PAGADAS
//////////////////////////////////////////////////////
const obtenerSalidas = async (req, res) => {
  try {
    const salidas = await Salida.find({
      EstatusPago: { $ne: 'PAGADO' }
    })
      .populate({
  path: 'ClienteEmpresa',
  populate: {
    path: 'empresa'
  }
})
      .populate('Productos.producto')
      .sort({ FolioSalida: -1 });

    res.json(salidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//////////////////////////////////////////////////////
// 📄 OBTENER PRODUCTOS POR CLIENTE
//////////////////////////////////////////////////////
const obtenerProductosPorCliente = async (req, res) => {
  try {
    const salidas = await Salida.find({
      ClienteEmpresa: req.params.clienteId
    })
      .populate('Productos.producto')
      .sort({ FolioSalida: -1 });

    res.json(salidas);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
// 🔄 ACTUALIZAR ESTATUS PAGO
//////////////////////////////////////////////////////
const actualizarEstatusPago = async (req, res) => {
  try {

    const salida = await Salida.findById(req.params.id);

    if (!salida) {
      return res.status(404).json({
        message: 'No encontrada'
      });
    }

    const estatusAnterior = salida.EstatusPago;
    const nuevoEstatus = req.body.EstatusPago;

    salida.EstatusPago = nuevoEstatus;

    await salida.save();

    await Auditoria.create({
      usuarioId: req.usuario.id,
      usuario: req.usuario.usuario,
      rol: req.usuario.rol,
      accion: 'ACTUALIZAR_PAGO',
      modulo: 'SALIDAS',
      descripcion: `Se actualizó el estatus de pago de la salida con folio ${salida.FolioSalida} de ${estatusAnterior} a ${nuevoEstatus}`
    });

    res.json(salida);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};
//////////////////////////////////////////////////////
// ❌ ELIMINAR PAGADAS
//////////////////////////////////////////////////////
const eliminarSalidasPagadas = async (req, res) => {
  try {
    const resultado = await Salida.deleteMany({
      EstatusPago: 'PAGADO'
    });

    res.json({
      eliminadas: resultado.deletedCount
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//////////////////////////////////////////////////////
module.exports = {
  crearSalida,
  devolverProducto,
  obtenerTodasSalidas,
  obtenerSalidas,
  obtenerProductosPorCliente,
  actualizarEstatusPago,
  eliminarSalidasPagadas
};