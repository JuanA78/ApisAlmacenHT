const mongoose = require("mongoose");

const auditoriaSchema = new mongoose.Schema(
    {
        usuarioId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Usuario",
            required: true
        },

        usuario: {
            type: String,
            required: true,
            trim: true
        },

        rol: {
            type: String,
            required: true,
            trim: true
        },

        accion: {
            type: String,
            required: true,
            trim: true
        },

        modulo: {
            type: String,
            required: true,
            trim: true
        },

        descripcion: {
            type: String,
            required: true,
            trim: true
        },

        fecha: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Auditoria", auditoriaSchema);