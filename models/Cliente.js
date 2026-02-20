const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  operador: { type: String, required: true },
  unidad: { type: String, required: true },
  kilometraje: { type: Number, required: true },
  empresa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empresa',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
