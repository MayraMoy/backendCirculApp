// backend/src/routes/admin.routes.js
const express = require('express');
const {
  getAdminMetrics,
  getAdminUsers,
  getAdminItems,
  promoteUser,
  updateAdminUser,
  getAdminReport
} = require('../controllers/adminController');
const auth = require('../middleware/auth');
const router = express.Router();

// Solo administradores y cuentas con rol DEV
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'dev' && !req.user.isDev) {
    return res.status(403).json({ msg: 'Acceso denegado.' });
  }
  next();
};

router.get('/metrics', auth, adminOnly, getAdminMetrics);
router.get('/users', auth, adminOnly, getAdminUsers);
router.get('/items', auth, adminOnly, getAdminItems);
router.post('/users/:id/promote', auth, adminOnly, promoteUser);
router.put('/users/:id', auth, adminOnly, updateAdminUser);

// Reportes administrativos descargables
router.get('/reports/:type', auth, adminOnly, getAdminReport);

module.exports = router;