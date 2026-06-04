const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants,
} = require('../controllers/restaurantController');

router.get('/', getRestaurants);
router.get('/owner/me', protect, authorize('restaurant_owner', 'admin'), getMyRestaurants);
router.get('/:id', getRestaurant);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createRestaurant);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateRestaurant);
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

module.exports = router;
