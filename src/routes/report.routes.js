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
  deleteReportedItem
} = require('../controllers/reportModerationController');

// Crear denuncia (Cualquier usuario autenticado)
router.post('/', validate(createReportSchema), createReport);

// Listar denuncias (Admin y Gestores)
router.get('/', getReports);

// Desestimar denuncia (Admin y Gestores)
router.patch('/:id/dismiss', dismissReport);

// Eliminar publicación denunciada (Admin y Gestores)
router.delete('/:id/item', deleteReportedItem);

module.exports = router;
