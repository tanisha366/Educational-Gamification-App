const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const { getMyStats } = require('../controllers/statsController')

router.get('/me/stats', protect, getMyStats)

module.exports = router