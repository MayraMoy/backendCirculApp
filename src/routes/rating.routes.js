const express = require('express');
const { createRating, getRatingsForUser } = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createRating);
router.get('/user/:userId', auth, getRatingsForUser); // ← nueva ruta

module.exports = router;