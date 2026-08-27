// backend/src/routes/user.routes.js
const express = require('express');
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil público de un usuario (con calificaciones promedio)
 * @access  Privado
 */
router.put('/profile', updateUserProfile);
router.get('/:id', getUserProfile);

module.exports = router;