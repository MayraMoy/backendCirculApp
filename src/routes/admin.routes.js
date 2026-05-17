// backend/src/routes/admin.routes.js
const express = require('express');
const {
  getAdminMetrics,
  getAdminUsers,
  getAdminItems,
  promoteUser,
  updateAdminUser
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const router = express.Router();

// Solo administradores
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Acceso denegado.' });
  }
  next();
};

router.get('/metrics', auth, adminOnly, getAdminMetrics);
router.get('/users', auth, adminOnly, getAdminUsers);
router.get('/items', auth, adminOnly, getAdminItems);
router.post('/users/:id/promote', auth, adminOnly, promoteUser);
router.put('/users/:id', auth, adminOnly, updateAdminUser);

// Reportes (simulados como descarga)
router.get('/reports/:type', auth, adminOnly, (req, res) => {
  res.json({ msg: `Reporte ${req.params.type} generado.` });
});

module.exports = router;