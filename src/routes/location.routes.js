// backend/src/routes/location.routes.js
const express = require('express');
const { geocodeAddress, reverseGeocode } = require('../controllers/locationController');
const auth = require('../middleware/auth');
const { geocodeLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.get('/geocode', auth, geocodeLimiter, geocodeAddress);
router.get('/reverse-geocode', auth, geocodeLimiter, reverseGeocode);

module.exports = router;