const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const validate = require('../middleware/validate');
const { updateUserProfileSchema } = require('../validators/user.validator');
const router = express.Router();

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Privado
 */
router.put('/profile', validate(updateUserProfileSchema), updateUserProfile);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil público de un usuario (con calificaciones promedio)
 * @access  Privado
 */
router.get('/:id', getUserProfile);

module.exports = router;