const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyWaitlist,
  cancelWaitlist,
  getBranchWaitlist,
} = require('../controllers/waitlistController');

router.get('/', protect, getMyWaitlist);
router.delete('/:id', protect, cancelWaitlist);
router.get('/branch/:branchId', protect, authorize('restaurant_owner', 'admin'), getBranchWaitlist);

module.exports = router;
