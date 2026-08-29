// backend/src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createReportSchema } = require('../validators/report.validator');
const {
  createReport,
  getReports,
  dismissReport,
  deleteReportedItem,
  deactivateReportedUser
} = require('../controllers/reportModerationController');

// Todas las rutas de denuncias requieren autenticación
router.use(auth);

// Crear denuncia (Publicación o Usuario)
router.post('/', validate(createReportSchema), createReport);

// Listar denuncias (Admin y Gestores)
router.get('/', getReports);

// Desestimar denuncia (Admin y Gestores)
router.patch('/:id/dismiss', dismissReport);

// Eliminar publicación denunciada (Admin y Gestores)
router.delete('/:id/item', deleteReportedItem);

// Desactivar usuario denunciado (Admin y Gestores)
router.patch('/:id/deactivate-user', deactivateReportedUser);

module.exports = router;
