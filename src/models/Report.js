// backend/src/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['item', 'user'],
    default: 'item'
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: function() {
      return this.targetType === 'item';
    }
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.targetType === 'user';
    }
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
        // Motivos para publicaciones
        'contenido_inapropiado',
        'categoria_incorrecta',
        'informacion_falsa',
        'material_no_reciclable',
        'spam_o_duplicado',
        'contacto_invalido',
        // Motivos para usuarios
        'usuario_sospechoso',
        'comportamiento_abusivo',
        'estafa_o_fraude',
        'suplantacion_identidad',
        'contacto_falso_o_invalido',
        // Común
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
    enum: ['pendiente', 'en_revision', 'desestimada', 'publicacion_eliminada', 'usuario_suspendido'],
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

// Índices compuestos para consultas rápidas
reportSchema.index({ targetType: 1, item: 1, reporter: 1, status: 1 });
reportSchema.index({ targetType: 1, reportedUser: 1, reporter: 1, status: 1 });
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
