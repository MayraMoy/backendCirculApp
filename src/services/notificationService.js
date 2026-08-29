// backend/src/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  /**
   * Crea y guarda una notificación individual
   */
  async createNotification({ recipientId, senderId = null, type, title, message, link = '', metadata = {} }) {
    try {
      if (!recipientId) return null;
      
      const notification = await Notification.create({
        recipientId,
        senderId,
        type,
        title,
        message,
        link,
        metadata
      });

      return notification;
    } catch (err) {
      console.error('Error al crear notificación:', err);
      return null;
    }
  }

  /**
   * Alerta a gestores y usuarios cuando se publica un nuevo material reciclable
   */
  async notifyNearbyUsersOnPublish({ item, authorId }) {
    try {
      if (!item || !authorId) return;

      // Notificar a todos los gestores y administradores activos de la comunidad
      const staffUsers = await User.find({
        _id: { $ne: authorId },
        active: { $ne: false },
        role: { $in: ['gestor', 'admin'] }
      }).select('_id name');

      const notificationsToCreate = staffUsers.map(user => ({
        recipientId: user._id,
        senderId: authorId,
        type: 'item_published_nearby',
        title: `Nuevo material: ${item.title || 'Reciclable'}`,
        message: `Se ha publicado un nuevo material en categoría "${item.category || 'General'}" en ${item.address || 'tu zona'}.`,
        link: `/items/${item._id}`,
        metadata: {
          itemId: item._id,
          category: item.category,
          address: item.address
        }
      }));

      if (notificationsToCreate.length > 0) {
        await Notification.insertMany(notificationsToCreate);
      }
    } catch (err) {
      console.error('Error en notifyNearbyUsersOnPublish:', err);
    }
  }

  /**
   * Notifica al donante cuando su material es compactado / fardado
   */
  async notifyItemBaled({ item, gestorId }) {
    try {
      if (!item || !item.ownerId) return;

      const recipientId = item.ownerId._id || item.ownerId;
      if (gestorId && gestorId.toString() === recipientId.toString()) return;

      await this.createNotification({
        recipientId,
        senderId: gestorId,
        type: 'item_baled',
        title: '¡Tu material ha sido compactado!',
        message: `Tu publicación "${item.title}" pasó al estado de fardo y está lista para su certificación comunal.`,
        link: `/items/${item._id}`,
        metadata: { itemId: item._id, processingState: 'fardado' }
      });
    } catch (err) {
      console.error('Error en notifyItemBaled:', err);
    }
  }

  /**
   * Notifica al donante cuando su fardo es validado y certificado técnicamente
   */
  async notifyItemValidated({ item, validatorId, checklistScore }) {
    try {
      if (!item || !item.ownerId) return;

      const recipientId = item.ownerId._id || item.ownerId;

      await this.createNotification({
        recipientId,
        senderId: validatorId,
        type: 'item_validated',
        title: '¡Material certificado con éxito! 🏆',
        message: `La cooperativa ha validado tu material "${item.title}" con un puntaje de calidad de ${checklistScore || 100}%. ¡Gracias por tu aporte a la economía circular!`,
        link: `/items/${item._id}`,
        metadata: { itemId: item._id, processingState: 'certificado' }
      });
    } catch (err) {
      console.error('Error en notifyItemValidated:', err);
    }
  }

  /**
   * Notifica a un usuario cuando recibe una nueva calificación comunitaria
   */
  async notifyRatingReceived({ ratedUserId, raterId, raterName, materialQuality, comment }) {
    try {
      if (!ratedUserId) return;
      if (raterId && raterId.toString() === ratedUserId.toString()) return;

      await this.createNotification({
        recipientId: ratedUserId,
        senderId: raterId,
        type: 'rating_received',
        title: 'Has recibido una nueva calificación ★',
        message: `${raterName || 'Un usuario'} te calificó con ${materialQuality} estrellas por tu entrega.${comment ? ` "${comment}"` : ''}`,
        link: '/profile',
        metadata: { materialQuality }
      });
    } catch (err) {
      console.error('Error en notifyRatingReceived:', err);
    }
  }
}

module.exports = new NotificationService();
