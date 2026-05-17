// backend/src/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['plastico', 'papel', 'vidrio', 'metal', 'textil', 'electronico', 'otro'],
    required: true
  },
  processingState: {
    type: String,
    enum: ['sin_procesar', 'en_proceso', 'fardado', 'validado'],
    default: 'sin_procesar'
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String }, // dirección legible (opcional)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String], // URLs de Cloudinary

  // Campos para RF15: Validación de fardos
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  validationChecklist: [String], // ej: ['limpieza', 'homogeneidad', 'compactado', 'etiquetado']
  validationObservations: { type: String, maxlength: 500 },
  validationDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);