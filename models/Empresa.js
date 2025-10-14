const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rfc: { type: String, required: true },
  domicilio: { type: String, required: true },
  regimenFiscal: { type: String, required: true },
  usoCFDI: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Empresa', empresaSchema);
