import { motion as Motion } from 'framer-motion'
import './leaderboard.css'

function getDeltaClass(value) {
  if (value > 0) return 'delta-up'
  if (value < 0) return 'delta-down'
  return 'delta-flat'
}

function getDeltaLabel(value) {
  if (value > 0) return `↑ ${value}`
  if (value < 0) return `↓ ${Math.abs(value)}`
  return '—'
}

function RankRow({ user }) {
  return (
    <Motion.article className="rank-row" layout transition={{ duration: 0.32 }}>
      <div className="rank-cell mono">#{user.rank}</div>
      <div className="avatar-cell">{user.initials}</div>
      <div className="name-cell">
        <strong>{user.name}</strong>
        <span>{user.subject}</span>
      </div>
      <div className="points-cell mono">{user.points}</div>
      <div className="badges-cell">
        {user.badges.map((badge) => (
          <span key={badge} className="badge-pill">{badge}</span>
        ))}
      </div>
      <div className={`change-cell ${getDeltaClass(user.weeklyChange)}`}>
        {getDeltaLabel(user.weeklyChange)}
      </div>
    </Motion.article>
  )
}

export default RankRow
