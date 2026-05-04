import './leaderboard.css'

function PodiumDisplay({ topThree = [] }) {
  const second = topThree[1]
  const first = topThree[0]
  const third = topThree[2]

  return (
    <section className="podium" aria-label="Top three players podium">
      {[second, first, third].map((user, index) => {
        if (!user) {
          return null
        }

        const position = user.rank
        const isChampion = position === 1

        return (
          <article
            key={user.id}
            className={`podium-slot pos-${position} ${index === 1 ? 'is-center' : ''}`}
          >
            <div className="podium-rank">#{position}</div>
            <div className="podium-avatar">{user.initials}</div>
            <h3>
              {isChampion ? '👑 ' : ''}
              {user.name}
            </h3>
            <p>{user.points} pts</p>
          </article>
        )
      })}
    </section>
  )
}

export default PodiumDisplay
