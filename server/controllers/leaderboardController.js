const User = require('../models/User')
const QuizAttempt = require('../models/QuizAttempt')
const UserBadge = require('../models/UserBadge')

exports.getLeaderboard = async (req, res) => {
  try {
    const { subject, period, page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    let dateFilter = null
    if (period === 'weekly') {
      dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - 7)
    } else if (period === 'monthly') {
      dateFilter = new Date()
      dateFilter.setMonth(dateFilter.getMonth() - 1)
    }

    if (subject && subject !== 'All') {
      const matchStage = { subject }
      if (dateFilter) {
        matchStage.completedAt = { $gte: dateFilter }
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            totalScore: { $sum: '$score' },
            quizCount: { $sum: 1 },
            avgScore: { $avg: '$score' }
          }
        },
        { $sort: { totalScore: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        { $unwind: '$userDetails' },
        {
          $project: {
            name: '$userDetails.name',
            totalScore: 1,
            quizCount: 1,
            avgScore: { $round: ['$avgScore', 1] }
          }
        }
      ]

      const results = await QuizAttempt.aggregate(pipeline)

      const data = results.map((item, index) => ({
        rank: skip + index + 1,
        _id: item._id,
        name: item.name,
        totalPoints: item.totalScore,
        quizzesCompleted: item.quizCount,
        avgScore: item.avgScore,
        isCurrentUser: item._id.toString() === req.user.id
      }))

      return res.json({
        success: true,
        data,
        page: parseInt(page),
        subject
      })
    }

    const total = await User.countDocuments()

    const users = await User.find()
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name totalPoints currentStreak')

    const data = await Promise.all(
      users.map(async (user, index) => {
        const badgesEarned = await UserBadge.countDocuments({
          userId: user._id
        })
        return {
          rank: skip + index + 1,
          _id: user._id,
          name: user.name,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          badgesEarned,
          isCurrentUser: user._id.toString() === req.user.id
        }
      })
    )

    res.json({
      success: true,
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    })

  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error fetching leaderboard'
    })
  }
}