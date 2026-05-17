// backend/src/routes/validation.routes.js
const express = require('express');
const { validateMaterial } = require('../controllers/validationController');
const auth = require('../middleware/auth');
const router = express.Router();

// Solo usuarios autenticados y gestores
router.post('/validate', auth, validateMaterial);

module.exports = router;