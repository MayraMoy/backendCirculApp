// backend/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Obtener notificaciones del usuario autenticado con conteo de no leídas
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;

    const [total, unreadCount, notifications] = await Promise.all([
      Notification.countDocuments({ recipientId: userId }),
      Notification.countDocuments({ recipientId: userId, read: false }),
      Notification.find({ recipientId: userId })
        .populate('senderId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    res.json({
      notifications,
      unreadCount,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ msg: 'Error al obtener notificaciones.' });
  }
};

/**
 * Marcar una notificación individual como leída
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'ID de notificación inválido.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notificación no encontrada.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      read: false
    });

    res.json({ notification, unreadCount });
  } catch (err) {
    console.error('Error al marcar notificación como leída:', err);
    res.status(500).json({ msg: 'Error al actualizar notificación.' });
  }
};

/**
 * Marcar todas las notificaciones del usuario como leídas
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany(
      { recipientId: userId, read: false },
      { $set: { read: true } }
    );

    res.json({ msg: 'Todas las notificaciones fueron marcadas como leídas.', unreadCount: 0 });
  } catch (err) {
    console.error('Error al marcar todas como leídas:', err);
    res.status(500).json({ msg: 'Error al actualizar notificaciones.' });
  }
};

/**
 * Eliminar una notificación
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'ID de notificación inválido.' });
    }

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      recipientId: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ msg: 'Notificación no encontrada.' });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user.id,
      read: false
    });

    res.json({ msg: 'Notificación eliminada.', unreadCount });
  } catch (err) {
    console.error('Error al eliminar notificación:', err);
    res.status(500).json({ msg: 'Error al eliminar notificación.' });
  }
};

/**
 * Limpiar todas las notificaciones ya leídas
 */
const clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({
      recipientId: userId,
      read: true
    });

    res.json({ msg: 'Notificaciones leídas eliminadas con éxito.' });
  } catch (err) {
    console.error('Error al limpiar notificaciones:', err);
    res.status(500).json({ msg: 'Error al limpiar notificaciones.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications
};
