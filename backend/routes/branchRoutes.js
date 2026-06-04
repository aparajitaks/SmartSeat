const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
} = require('../controllers/branchController');

router.get('/restaurant/:restaurantId', getBranches);
router.get('/:id', getBranch);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createBranch);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateBranch);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteBranch);

module.exports = router;
