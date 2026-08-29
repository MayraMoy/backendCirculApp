const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Item = require('../models/Item');
const notificationService = require('../services/notificationService');

// Crear una nueva calificación
const createRating = async (req, res) => {
  try {
    const { itemId, materialQuality, punctuality, standardCompliance, comment } = req.body;
    
    // Validar que el ítem exista
    const item = await Item.findById(itemId).populate('ownerId');
    if (!item) return res.status(404).json({ msg: 'Ítem no encontrado.' });

    // No permitir auto-calificación
    if (item.ownerId._id.toString() === req.user.id) {
      return res.status(400).json({ msg: 'No puedes calificarte a ti mismo.' });
    }

    const newRating = new Rating({
      itemId,
      raterId: req.user.id,
      ratedId: item.ownerId._id,
      materialQuality,
      punctuality,
      standardCompliance,
      comment
    });

    await newRating.save();

    // Notificar al usuario que recibió la calificación
    notificationService.notifyRatingReceived({
      ratedUserId: item.ownerId._id,
      raterId: req.user.id,
      raterName: req.user.name || 'Un miembro de la comunidad',
      materialQuality,
      comment
    }).catch(err => console.error('Error al emitir notificación de calificación:', err));

    res.status(201).json({ msg: 'Calificación enviada exitosamente.', rating: newRating });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Ya calificaste este ítem.' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Error al crear la calificación.' });
  }
};

// Obtener calificaciones recibidas por un usuario con paginación y agregación nativa
const getRatingsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Identificador de usuario inválido.' });
    }

    const pageNum = parseInt(req.query.page, 10) || 1;
    const limitNum = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (pageNum - 1) * limitNum;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Agregación eficiente en MongoDB para métricas globales
    const [stats] = await Rating.aggregate([
      { $match: { ratedId: userObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgQuality: { $avg: '$materialQuality' },
          avgPunctuality: { $avg: '$punctuality' },
          avgCompliance: { $avg: '$standardCompliance' }
        }
      }
    ]);

    const total = stats?.total || 0;

    if (total === 0) {
      return res.json({
        ratings: [],
        averages: { materialQuality: 0, punctuality: 0, standardCompliance: 0 },
        total: 0,
        page: 1,
        totalPages: 0
      });
    }

    const paginatedRatings = await Rating.find({ ratedId: userObjectId })
      .populate('raterId', 'name')
      .populate('itemId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      ratings: paginatedRatings,
      averages: {
        materialQuality: parseFloat((stats.avgQuality || 0).toFixed(1)),
        punctuality: parseFloat((stats.avgPunctuality || 0).toFixed(1)),
        standardCompliance: parseFloat((stats.avgCompliance || 0).toFixed(1))
      },
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener las reseñas.' });
  }
};

module.exports = { createRating, getRatingsForUser };