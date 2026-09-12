// backend/src/routes/recyclingPoint.routes.js
const express = require('express');
const {
  getRecyclingPoints,
  getRecyclingPointById,
  createRecyclingPoint,
  updateRecyclingPoint,
  deleteRecyclingPoint
} = require('../controllers/recyclingPointController');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware para autorizar gestores, coordinadores y administradores
const managerOrAdmin = (req, res, next) => {
  const allowed = ['gestor', 'coordinador', 'admin', 'dev'];
  if (!req.user || (!allowed.includes(req.user.role) && !req.user.isDev)) {
    return res.status(403).json({ msg: 'Acceso denegado. Se requiere rol de gestor o administrador.' });
  }
  next();
};

// Rutas públicas de consulta
router.get('/', getRecyclingPoints);
router.get('/:id', getRecyclingPointById);

// Rutas de administración y gestión
router.post('/', auth, managerOrAdmin, createRecyclingPoint);
router.put('/:id', auth, managerOrAdmin, updateRecyclingPoint);
router.delete('/:id', auth, managerOrAdmin, deleteRecyclingPoint);

module.exports = router;
