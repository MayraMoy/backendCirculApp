// backend/src/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'El material a denunciar es obligatorio']
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario denunciante es obligatorio']
  },
  reason: {
    type: String,
    enum: {
      values: [
        'contenido_inapropiado',
        'categoria_incorrecta',
        'informacion_falsa',
        'material_no_reciclable',
        'spam_o_duplicado',
        'contacto_invalido',
        'otro'
      ],
      message: 'Motivo de denuncia no válido'
    },
    required: [true, 'El motivo de la denuncia es obligatorio']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
    default: ''
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_revision', 'desestimada', 'publicacion_eliminada'],
    default: 'pendiente'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String,
    trim: true,
    default: ''
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índice compuesto para consultas rápidas por ítem, denunciante y estado
reportSchema.index({ item: 1, reporter: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
