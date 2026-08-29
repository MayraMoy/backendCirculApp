// backend/src/routes/notification.routes.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// Todas las rutas de notificaciones requieren usuario autenticado
router.use(auth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);
router.delete('/clear-all', clearReadNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
