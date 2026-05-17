// backend/src/routes/location.routes.js
const express = require('express');
const { geocodeAddress, reverseGeocode } = require('../controllers/locationController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/geocode', auth, geocodeAddress);
router.get('/reverse-geocode', auth, reverseGeocode); // ← nueva ruta

module.exports = router;