const express = require('express');
const { createRating, getRatingsForUser } = require('../controllers/ratingController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createRatingSchema } = require('../validators/rating.validator');
const router = express.Router();

router.post('/', auth, validate(createRatingSchema), createRating);
router.get('/user/:userId', auth, getRatingsForUser);

module.exports = router;