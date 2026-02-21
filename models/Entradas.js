const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Productos',
    required: true
  },
  FolioCompra: { type: String, required: true },
  CantidadInicial: { type: Number, required: true },
  CantidadDisponible: { type: Number, required: true },
  PrecioCompra: { type: Number, required: true },
FechaCompra: {
  type: Date,
  default: () => {
    const hoy = new Date();
    hoy.setHours(12, 0, 0, 0); // mediodía para evitar saltos de día
    return hoy;
  }
}});

module.exports = mongoose.model('Entradas', compraSchema);
