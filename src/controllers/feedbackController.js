// backend/src/controllers/feedbackController.js
const FeedbackReport = require("../models/FeedbackReport");

/**
 * Registrar un nuevo feedback o reporte de prueba
 * POST /api/feedback
 * Acceso: Público / Autenticado (con o sin token)
 */
const createFeedback = async (req, res) => {
  try {
    const { title, comment, category, rating, type, pageUrl, featureTested, userName, userEmail } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({ msg: "El comentario o detalle es obligatorio." });
    }

    // Procesar imágenes adjuntas (Cloudinary o Disco local)
    const attachments = req.files ? req.files.map(f => {
      if (f.path && (f.path.startsWith("http://") || f.path.startsWith("https://"))) {
        return f.path;
      }
      if (f.secure_url) {
        return f.secure_url;
      }
      if (f.filename) {
        return `${req.protocol}://${req.get("host")}/uploads/items/${f.filename}`;
      }
      return f.path || f.url;
    }) : [];

    const user = req.user;
    const finalUserName = user ? (user.name || user.email) : (userName?.trim() || "Usuario de la comunidad");
    const finalUserEmail = user ? user.email : (userEmail?.trim() || "");
    const finalUserRole = user ? (user.role || "user") : "invitado";

    const newFeedback = new FeedbackReport({
      userId: user ? user.id : null,
      userName: finalUserName,
      userEmail: finalUserEmail,
      userRole: finalUserRole,
      type: type || "general_feedback",
      rating: Number(rating) || 5,
      category: category || "general",
      title: title ? title.trim() : "Comentario sobre la plataforma",
      comment: comment.trim(),
      attachments,
      pageUrl: pageUrl || "/",
      featureTested: featureTested ? featureTested.trim() : "",
      status: "nuevo"
    });

    await newFeedback.save();

    res.status(201).json({
      msg: "¡Gracias por tus comentarios! Nos ayudas a construir una mejor experiencia.",
      feedback: newFeedback
    });
  } catch (err) {
    console.error("Error en createFeedback:", err);
    res.status(500).json({ msg: "Error interno al enviar tus comentarios." });
  }
};

/**
 * Listar comentarios y reportes de la comunidad (para evitar duplicados)
 * GET /api/feedback
 * Acceso: Público / Usuarios / Gestores / Admin
 */
const getFeedbacks = async (req, res) => {
  try {
    const { type, category, status, limit = 50 } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const feedbacks = await FeedbackReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .lean();

    res.json({
      total: feedbacks.length,
      feedbacks
    });
  } catch (err) {
    console.error("Error en getFeedbacks:", err);
    res.status(500).json({ msg: "Error al recuperar los comentarios de la comunidad." });
  }
};

/**
 * Actualizar estado de un feedback (Gestores, Admin, Dev)
 * PATCH /api/feedback/:id/status
 */
const updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["nuevo", "en_revision", "resuelto", "descartado"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Estado de feedback inválido." });
    }

    const updated = await FeedbackReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Reporte de feedback no encontrado." });
    }

    res.json({ msg: "Estado actualizado.", feedback: updated });
  } catch (err) {
    console.error("Error en updateFeedbackStatus:", err);
    res.status(500).json({ msg: "Error al actualizar estado del reporte." });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks,
  updateFeedbackStatus
};
