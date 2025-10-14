// src/server/models/Movimiento.js
const mongoose = require('mongoose');

const movimientoSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
    NombreProducto: String,
    NoParte: String,
    tipo: { type: String, enum: ['Entrada', 'Salida'] },
    fecha: {
        type: Date,
        default: () => {
            const ahora = new Date();
            // Ajusta a zona horaria local (por ejemplo: UTC-6 para México)
            const offsetMs = ahora.getTimezoneOffset() * 60000;
            return new Date(ahora.getTime() - offsetMs);
        }
    },
    cantidad: Number,
    precio: Number,
    nombreCliente: String, // 🔁 campo agregado
    estatus:String
    }
);

module.exports = mongoose.model('Movimiento', movimientoSchema);
