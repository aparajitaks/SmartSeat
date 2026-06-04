const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createReservation,
  getMyReservations,
  getReservation,
  cancelReservation,
  checkIn,
  completeReservation,
  getBranchReservations,
} = require('../controllers/reservationController');

router.post('/', protect, createReservation);
router.get('/', protect, getMyReservations);
router.get('/branch/:branchId', protect, authorize('restaurant_owner', 'admin'), getBranchReservations);
router.get('/:id', protect, getReservation);
router.put('/:id/cancel', protect, cancelReservation);
router.put('/:id/check-in', protect, authorize('restaurant_owner', 'admin'), checkIn);
router.put('/:id/complete', protect, authorize('restaurant_owner', 'admin'), completeReservation);

module.exports = router;
