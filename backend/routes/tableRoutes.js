const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTables,
  getAvailableTables,
  createTable,
  updateTable,
  deleteTable,
} = require('../controllers/tableController');

router.get('/available', getAvailableTables);
router.get('/branch/:branchId', getTables);
router.post('/', protect, authorize('restaurant_owner', 'admin'), createTable);
router.put('/:id', protect, authorize('restaurant_owner', 'admin'), updateTable);
router.delete('/:id', protect, authorize('restaurant_owner', 'admin'), deleteTable);

module.exports = router;
