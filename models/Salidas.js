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
    // SOLO si es INTERNA
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
      const ahora = new Date();
      const offsetMs = ahora.getTimezoneOffset() * 60000;
      return new Date(ahora.getTime() - offsetMs);
    }
  },

  EstatusPago: {
    type: String,
    enum: ['PAGADO', 'NO PAGADO', 'PENDIENTE']
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
      Cantidad: Number,
      PrecioVenta: Number
    }
  ]
});

module.exports = mongoose.model('Salida', salidaSchema);
