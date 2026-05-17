// backend/src/controllers/ratingController.js
const Rating = require('../models/Rating');
const Item = require('../models/Item');

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
    res.status(201).json({ msg: 'Calificación enviada exitosamente.', rating: newRating });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Ya calificaste este ítem.' });
    }
    console.error(err);
    res.status(500).json({ msg: 'Error al crear la calificación.' });
  }
};

// Obtener calificaciones recibidas por un usuario
const getRatingsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = await Rating.find({ ratedId: userId })
      .populate('raterId', 'name')
      .populate('itemId', 'title')
      .sort({ createdAt: -1 });

    const total = ratings.length;
    if (total === 0) {
      return res.json({
        ratings: [],
        averages: { materialQuality: 0, punctuality: 0, standardCompliance: 0 },
        total: 0
      });
    }

    const avgQuality = (ratings.reduce((sum, r) => sum + r.materialQuality, 0) / total).toFixed(1);
    const avgPunctuality = ratings.some(r => r.punctuality !== undefined)
      ? (ratings.reduce((sum, r) => sum + (r.punctuality || 0), 0) / total).toFixed(1)
      : 0;
    const avgCompliance = ratings.some(r => r.standardCompliance !== undefined)
      ? (ratings.reduce((sum, r) => sum + (r.standardCompliance || 0), 0) / total).toFixed(1)
      : 0;

    res.json({
      ratings,
      averages: {
        materialQuality: parseFloat(avgQuality),
        punctuality: parseFloat(avgPunctuality),
        standardCompliance: parseFloat(avgCompliance)
      },
      total
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error al obtener las reseñas.' });
  }
};

module.exports = { createRating, getRatingsForUser };