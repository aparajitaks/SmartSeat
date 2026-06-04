const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard } = require('../controllers/analyticsController');

router.get('/dashboard', protect, authorize('restaurant_owner', 'admin'), getDashboard);

module.exports = router;
