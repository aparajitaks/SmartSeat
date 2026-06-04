const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getRestaurantReviews } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);

module.exports = router;
