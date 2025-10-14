const mongoose = require('mongoose');

const productoClienteSchema = new mongoose.Schema({
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto',
    required: true
  },
  nombreProducto: { type: String, required: true },
  noParte: { type: String, required: true },
  cantidad: { type: Number, required: true },
  precio: { type: Number, required: true },
  fecha: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductoCliente', productoClienteSchema);
