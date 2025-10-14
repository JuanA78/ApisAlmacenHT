const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rfc: { type: String, required: true },
  domicilio: { type: String, required: true },
  regimenFiscal: { type: String, required: true },
  usoCFDI: { type: String, required: true },
  operador: { type: String, required: true },      // Puedes poner 'required: true' si es obligatorio
  unidad: { type: String, required: true },
  kilometraje: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
