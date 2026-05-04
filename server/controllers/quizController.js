const Quiz = require('../models/Quiz')
const QuizAttempt = require('../models/QuizAttempt')
const User = require('../models/User')
const { checkAndAwardBadges } = require('../utils/badgeChecker')
const { updateStreak } = require('../utils/streakHelper')

// ========================================
// HELPER — Fisher-Yates Shuffle
// ========================================

const shuffleArray = (array) => {
  const arr = [...array]

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }

  return arr
}

// ========================================
// GET ALL QUIZZES — 
// ========================================
exports.getAll = async (req, res) => {
  try {
  
    const filter = { isPublished: true } 
    if (req.query.subject) {
      filter.subject = req.query.subject
    }

    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty
    }
    const quizzes = await Quiz.find(filter)
      .select('title subject difficulty questions createdAt')
    const formattedQuizzes = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      estimatedMinutes: Math.ceil(quiz.questions.length * 0.5)
    }))

    res.json({
      success: true,
      data: formattedQuizzes
    })

  } catch (error) {
    console.error('Get quizzes error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ========================================
// GET SINGLE QUIZ 
// ========================================
exports.getOne = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      })
    }

    const shuffledQuestions = quiz.questions.map(question => ({
      _id: question._id,
      questionText: question.questionText,
      timeLimitSeconds: question.timeLimitSeconds,
      options: shuffleArray(
        question.options.map((opt, index) => ({
          _id: opt._id,
          text: opt.text,
          originalIndex: index
        }))
      )
    }))

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        questions: shuffledQuestions
      }
    })

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid quiz ID format'
      })
    }
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ========================================
// SUBMIT QUIZ — Scoring + Points + Badges
// ========================================
exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' })
    }
    const { answers, timeTakenSeconds } = req.body

    let correctCount = 0
    const evaluatedAnswers = []
    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId)

      if (!question) continue 
      const selectedOption = question.options[answer.selectedOptionIndex]

      const isCorrect = selectedOption ? selectedOption.isCorrect : false

      if (isCorrect) correctCount++
      const correctIndex = question.options.findIndex(opt => opt.isCorrect)

      evaluatedAnswers.push({
        questionId: answer.questionId,
        selectedOptionIndex: answer.selectedOptionIndex,
        isCorrect,
        correctIndex 
      })
    }
    const totalQuestions = quiz.questions.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    let pointsEarned = 25
    if (score >= 90) pointsEarned = 100
    else if (score >= 70) pointsEarned = 75
    else if (score >= 50) pointsEarned = 50
    await QuizAttempt.create({
      userId: req.user.id, 
      quizId: quiz._id,
      subject: quiz.subject, 
      answers: evaluatedAnswers,
      score,
      timeTakenSeconds: timeTakenSeconds || 0
    })
    const user = await User.findById(req.user.id)
    updateStreak(user)        
    user.totalPoints += pointsEarned  
    await user.save()        
    const newBadges = await checkAndAwardBadges(user._id, { score })

    res.json({
      success: true,
      data: {
        score,
        correctCount,
        totalQuestions,
        pointsEarned,
        newTotalPoints: user.totalPoints,
        correctAnswers: evaluatedAnswers,
        newBadges 
      }
    })

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID' })
    }
    console.error('Submit quiz error:', error)
    res.status(500).json({ success: false, message: 'Server error during quiz submission' })
  }
}