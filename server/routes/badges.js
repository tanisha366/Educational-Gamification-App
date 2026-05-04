const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const { getAllBadges } = require('../controllers/badgeController')

router.get('/', protect, getAllBadges)

module.exports = router