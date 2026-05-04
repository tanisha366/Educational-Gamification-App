const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { getSuggestions } = require('../controllers/aiController')
 

router.post('/suggestions', protect, authLimiter, getSuggestions)

module.exports = router