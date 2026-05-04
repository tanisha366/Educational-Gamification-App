const Badge = require('../models/Badge')
const UserBadge = require('../models/UserBadge')

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
