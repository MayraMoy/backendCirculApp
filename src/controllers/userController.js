const mongoose = require('mongoose');
const User = require('../models/User');
const Rating = require('../models/Rating');

// Obtener perfil público de un usuario (con calificaciones promedio optimizadas en MongoDB)
const getUserProfile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ msg: 'Identificador de usuario inválido.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });

    // Agregación de métricas de calificaciones directamente en MongoDB
    const [stats] = await Rating.aggregate([
      { $match: { ratedId: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgQuality: { $avg: '$materialQuality' },
          avgPunctuality: { $avg: '$punctuality' }
        }
      }
    ]);

    // Permitir ver email/teléfono si es el propio usuario o staff administrativo
    const isSelfOrStaff = req.user && (
      req.user.id === user._id.toString() ||
      ['admin', 'gestor', 'dev'].includes(req.user.role) ||
      req.user.isDev
    );

    res.json({
      id: user._id,
      name: user.name,
      email: isSelfOrStaff ? user.email : undefined,
      phone: isSelfOrStaff ? (user.phone || '') : undefined,
      role: user.role,
      location: user.location || '',
      bio: user.bio || '',
      ratings: {
        count: stats?.count || 0,
        materialQuality: stats?.avgQuality ? stats.avgQuality.toFixed(1) : null,
        punctuality: stats?.avgPunctuality ? stats.avgPunctuality.toFixed(1) : null
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error al obtener perfil.' });
  }
};

// Actualizar perfil de usuario
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, phone, location, bio } = req.body;
    const userId = req.user.id;
    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    // Solo validar email si se está actualizando y es diferente al actual
    if (email) {
      const sanitizedEmail = email.toLowerCase().trim();
      const currentUser = await User.findById(userId);
      if (sanitizedEmail !== currentUser.email) {
        const existingUser = await User.findOne({ email: sanitizedEmail });
        if (existingUser) {
          return res.status(400).json({ msg: 'El correo electrónico ya está en uso.' });
        }
      }
      updateData.email = sanitizedEmail;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true, select: '-password' }
    );

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || '',
      location: updatedUser.location || '',
      bio: updatedUser.bio || ''
    });
  } catch (err) {
    console.error('Error en updateUserProfile:', err);
    res.status(500).json({ msg: 'Error al actualizar el perfil.' });
  }
};

module.exports = { getUserProfile, updateUserProfile };
