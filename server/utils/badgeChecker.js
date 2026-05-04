const Badge = require('../models/Badge')
const UserBadge = require('../models/UserBadge')
const QuizAttempt = require('../models/QuizAttempt')
const User = require('../models/User')

exports.checkAndAwardBadges = async (userId, attemptData) => {
  const [allBadges, alreadyEarned, user, totalAttempts] = await Promise.all([
    Badge.find(),                              
    UserBadge.find({ userId }),                
    User.findById(userId),                     
    QuizAttempt.countDocuments({ userId })     
  ])

  
  const earnedIds = new Set(
    alreadyEarned.map(ub => ub.badgeId.toString())
  )

  const newBadges = []
  for (const badge of allBadges) {
    if (earnedIds.has(badge._id.toString())) continue

    let qualified = false
    const req = badge.requirement
    switch (req.type) {
      case 'quizCount':
        qualified = totalAttempts >= req.value
        break

      case 'perfectScore':
        qualified = attemptData.score === 100
        break

      case 'streak':
        qualified = user.currentStreak >= req.value
        break

      case 'timeOfDay':
        qualified = new Date().getHours() >= req.value
        break

      case 'subjectCount':
        const subjectCount = await QuizAttempt.countDocuments({
          userId,
          subject: req.subject
        })
        qualified = subjectCount >= req.value
        break
    }

    if (qualified) {
      try {
        await UserBadge.create({ userId, badgeId: badge._id })
        newBadges.push(badge)
      } catch (err) {
        if (err.code !== 11000) throw err
      }
    }
  }

  return newBadges 
}
  exports.getAllBadges = async (req, res) => {
  try {
    const allBadges = await Badge.find()

    const userBadges = await UserBadge.find({ userId: req.user.id })
    const earnedMap = {}
    userBadges.forEach(ub => {
      earnedMap[ub.badgeId.toString()] = ub.earnedAt
    })

    const badgesWithStatus = allBadges.map(badge => ({
      _id: badge._id,
      name: badge.name,
      description: badge.description,
      iconName: badge.iconName,
      rarity: badge.rarity,
      requirement: badge.requirement,
      earned: !!earnedMap[badge._id.toString()],
      earnedAt: earnedMap[badge._id.toString()] || null
    }))

    res.json({
      success: true,
      data: badgesWithStatus
    })

  } catch (error) {
    console.error('Get badges error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching badges'
    })
  }
}
