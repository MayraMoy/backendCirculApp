// backend/src/routes/validation.routes.js
const express = require('express');
const { validateMaterial } = require('../controllers/validationController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { validateMaterialSchema } = require('../validators/validation.validator');
const router = express.Router();

// Solo usuarios autenticados y gestores
router.post('/validate', auth, validate(validateMaterialSchema), validateMaterial);

module.exports = router;