// backend/src/routes/feedback.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createFeedback,
  getFeedbacks,
  updateFeedbackStatus
} = require("../controllers/feedbackController");

// Crear feedback o reporte (público o autenticado)
router.post("/", optionalAuth, upload.array("attachments", 3), createFeedback);

// Listar comentarios y reportes (acceso transparente para todos los roles y visitantes)
router.get("/", optionalAuth, getFeedbacks);

// Moderar estado de un reporte (admin, gestor, dev)
router.patch("/:id/status", auth, (req, res, next) => {
  const isStaff = ["admin", "gestor", "dev", "coordinador"].includes(req.user?.role) || req.user?.isDev;
  if (!isStaff) {
    return res.status(403).json({ msg: "Acceso denegado: solo personal autorizado." });
  }
  next();
}, updateFeedbackStatus);

module.exports = router;
