const express = require('express')
const router = express.Router()
const protect = require('../middleware/auth')
const { getAll, getOne, submitQuiz } = require('../controllers/quizController')

router.get('/', protect, getAll)
router.get('/:id', protect, getOne)
router.post('/:id/submit', protect, submitQuiz)

module.exports = router