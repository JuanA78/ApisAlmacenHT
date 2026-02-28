const mongoose = require('mongoose');

const salidaSchema = new mongoose.Schema({

  FolioSalida: {
    type: Number,
    required: true,
    unique: true
  },

  Cliente: {
    type: String,
    required: true
  },

  ClienteEmpresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    default: null
  },

  TipoVenta: {
    type: String,
    enum: ['PUBLICO', 'INTERNA'],
    required: true
  },

  FechaSalida: {
    type: Date,
    default: () => {
      const hoy = new Date();
      hoy.setHours(12, 0, 0, 0);
      return hoy;
    }
  },

  EstatusPago: {
    type: String,
    enum: ['PAGADO', 'NO PAGADO', 'PENDIENTE'],
    default: 'PENDIENTE'
  },

  Productos: [
    {
      producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Productos',
        required: true
      },

      NombreProducto: String,
      NoParte: String,

      //  ANTES ERA: Cantidad
    
      CantidadVendida: {
        type: Number,
        required: true
      },

      // NUEVO CAMPO
      CantidadDevuelta: {
        type: Number,
        default: 0
      },

      // NUEVO CAMPO
      Estado: {
        type: String,
        enum: ['ACTIVO', 'PARCIAL', 'DEVUELTO'],
        default: 'ACTIVO'
      },

      PrecioVenta: Number,

      //  NUEVO: para saber a qué lote regresar
      LotesDescontados: [
        {
          loteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Entradas'
          },
          cantidad: Number,
          devuelto: {
            type: Number,
            default: 0
          }
        }
      ]
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('Salida', salidaSchema);