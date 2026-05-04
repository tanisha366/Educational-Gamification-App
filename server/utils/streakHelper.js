exports.updateStreak = (user) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (!user.lastActiveDate) {
    user.currentStreak = 1
    user.lastActiveDate = today
    return
  }
  const lastActive = new Date(user.lastActiveDate)
  lastActive.setHours(0, 0, 0, 0)
  const diffMs = today - lastActive
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return
  } else if (diffDays === 1) {
    user.currentStreak += 1
  } else {
    user.currentStreak = 1
  }
  user.lastActiveDate = today
}