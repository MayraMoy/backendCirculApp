// backend/src/models/FeedbackReport.js
const mongoose = require("mongoose");

const feedbackReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  userName: {
    type: String,
    default: "Usuario Anónimo"
  },
  userEmail: {
    type: String,
    default: ""
  },
  userRole: {
    type: String,
    enum: ["user", "gestor", "coordinador", "admin", "dev", "invitado"],
    default: "user"
  },
  type: {
    type: String,
    enum: ["general_feedback", "beta_feature", "bug_report", "suggestion"],
    default: "general_feedback"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  category: {
    type: String,
    enum: ["ux_ui", "mapa_geolocalizacion", "publicaciones", "notificaciones", "rendimiento", "general", "otro"],
    default: "general"
  },
  title: {
    type: String,
    trim: true,
    maxlength: 120,
    default: "Comentario sobre la plataforma"
  },
  comment: {
    type: String,
    required: [true, "El comentario o descripción es obligatorio."],
    trim: true,
    maxlength: 2000
  },
  attachments: [{
    type: String
  }],
  pageUrl: {
    type: String,
    default: "/"
  },
  featureTested: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["nuevo", "en_revision", "resuelto", "descartado"],
    default: "nuevo"
  }
}, { timestamps: true });

feedbackReportSchema.index({ createdAt: -1 });
feedbackReportSchema.index({ status: 1 });
feedbackReportSchema.index({ type: 1 });

module.exports = mongoose.model("FeedbackReport", feedbackReportSchema);
