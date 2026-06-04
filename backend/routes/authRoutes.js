const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { register, login, getMe, updateProfile, refresh, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const { authLimiter } = require('../middleware/rateLimiter');

router.post(
  '/register',
  authLimiter,
  [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['customer', 'restaurant_owner'])
      .withMessage('Invalid role'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

router.post(
  '/refresh',
  authLimiter,
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required').trim(),
  ],
  validate,
  refresh
);

router.post(
  '/logout',
  authLimiter,
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required').trim(),
  ],
  validate,
  logout
);

module.exports = router;
