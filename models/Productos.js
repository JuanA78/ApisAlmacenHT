const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  NombreProducto: { type: String, required: true },
  Marca: { type: String, required: true },
  Proveedor: { type: String, required: true },
  UnidadMedida: { type: String, required: true },
  NoParte: { type: String, required: true, unique: true },
  FolioCompra: { type: String, required: true, unique: true },
  CodigoBarras: { type: String, required: true },
  Existencia: { type: Number, required: true },
  PrecioCompra: { type: Number, required: true },
  PrecioVenta: { type: Number, required: true },
  Estante: { type: String, required: true },
  Nivel: { type: String, required: true }
});

module.exports = mongoose.model('Producto', productoSchema);
