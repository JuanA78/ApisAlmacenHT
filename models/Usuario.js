const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    usuario: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    rol: {
      type: String,
      enum: ['administrador', 'user'],
      default: 'user',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Usuario', usuarioSchema);