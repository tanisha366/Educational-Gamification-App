const User = require('../models/User')
const QuizAttempt = require('../models/QuizAttempt')
const UserBadge = require('../models/UserBadge')

exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id

    const user = await User.findById(userId).select('-passwordHash')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .populate('quizId', 'title subject')

    // ====================================
    // SCORES BY DATE — last 7 days
    // ====================================
    const scoresByDate = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(date.getDate() + 1)

      const dayAttempts = attempts.filter(a => {
        const completed = new Date(a.completedAt)
        return completed >= date && completed < nextDate
      })

      const avgScore = dayAttempts.length
        ? Math.round(
            dayAttempts.reduce((sum, a) => sum + a.score, 0) / dayAttempts.length
          )
        : 0

      scoresByDate.push({
        date: date.toISOString().split('T')[0], 
        score: avgScore
      })
    }

    // ====================================
    // SCORES BY SUBJECT
    // ====================================
    const subjects = ['Math', 'Science', 'English', 'History', 'General']
    const scoresBySubject = {}

    for (const subject of subjects) {
      const subAttempts = attempts.filter(a => a.subject === subject)
      scoresBySubject[subject] = subAttempts.length
        ? Math.round(
            subAttempts.reduce((sum, a) => sum + a.score, 0) / subAttempts.length
          )
        : 0
    }

    // ====================================
    // BADGES COUNT
    // ====================================
    const badgesEarned = await UserBadge.countDocuments({ userId })

    // ====================================
    // RECENT ATTEMPTS — last 5
    // ====================================
    const recentAttempts = attempts.slice(0, 5).map(a => ({
      quizTitle: a.quizId ? a.quizId.title : 'Quiz',
      subject: a.subject,
      score: a.score,
      completedAt: a.completedAt
    }))

    res.json({
      success: true,
      data: {
        totalPoints: user.totalPoints,
        quizzesCompleted: attempts.length,
        currentStreak: user.currentStreak,
        badgesEarned,
        scoresByDate,
        scoresBySubject,
        recentAttempts
      }
    })

  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching stats'
    })
  }
}