const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { register, login, getMe } = require('../controllers/authController')
const protect = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
router.post(
  '/register',
  authLimiter, 
  [
    body('name')
      .notEmpty().withMessage('Name is required')
      .trim(),
    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  register 
)

router.post(
  '/login',
  authLimiter,
  [
    body('email')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  login
)
router.get('/me', protect, getMe)

module.exports = router