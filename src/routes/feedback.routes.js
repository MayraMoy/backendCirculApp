// backend/src/routes/feedback.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const { feedbackLimiter } = require("../middleware/rateLimiter");
const {
  createFeedbackSchema,
  updateFeedbackStatusSchema
} = require("../validators/feedback.validator");
const {
  createFeedback,
  getFeedbacks,
  updateFeedbackStatus
} = require("../controllers/feedbackController");

// Crear feedback o reporte (público o autenticado) con rate limiter y validación Zod
router.post("/", feedbackLimiter, optionalAuth, upload.array("attachments", 3), validate(createFeedbackSchema), createFeedback);

// Listar comentarios y reportes (acceso transparente para todos los roles y visitantes)
router.get("/", optionalAuth, getFeedbacks);

// Moderar estado de un reporte (admin, gestor, dev)
router.patch("/:id/status", auth, (req, res, next) => {
  const isStaff = ["admin", "gestor", "dev", "coordinador"].includes(req.user?.role) || req.user?.isDev;
  if (!isStaff) {
    return res.status(403).json({ msg: "Acceso denegado: solo personal autorizado." });
  }
  next();
}, validate(updateFeedbackStatusSchema), updateFeedbackStatus);

module.exports = router;
