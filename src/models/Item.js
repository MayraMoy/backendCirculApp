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
  // Estándar GeoJSON con soporte para índices 2dsphere nativos y retrocompatibilidad
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // Formato GeoJSON: [longitud, latitud]
      required: true,
      default: [0, 0]
    },
    lat: { type: Number },
    lng: { type: Number }
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

// Sincronizar coordenadas antes de guardar
itemSchema.pre('validate', function (next) {
  if (this.location) {
    const lat = this.location.lat !== undefined ? this.location.lat : (this.location.coordinates ? this.location.coordinates[1] : 0);
    const lng = this.location.lng !== undefined ? this.location.lng : (this.location.coordinates ? this.location.coordinates[0] : 0);
    this.location.type = 'Point';
    this.location.coordinates = [lng, lat];
    this.location.lat = lat;
    this.location.lng = lng;
  }
  next();
});

// Índice geoespacial 2dsphere nativo para búsquedas por radio ultra-eficientes
itemSchema.index({ location: '2dsphere' });
itemSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Item', itemSchema);