import { useEffect, useMemo, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { AnimatePresence } from 'framer-motion'
import { leaderboardMock } from '../mocks/leaderboardMock'
import { useAuth } from '../context/AuthContext'
import PodiumDisplay from '../components/leaderboard/PodiumDisplay'
import RankRow from '../components/leaderboard/RankRow'
import LeaderboardFilter from '../components/leaderboard/LeaderboardFilter'
import '../components/leaderboard/leaderboard.css'

const ITEMS_PER_PAGE = 10

function toInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function selectPointsByRange(user, timeRange) {
  if (timeRange === 'monthly') return user.monthlyPoints
  if (timeRange === 'all-time') return user.allTimePoints
  return user.weeklyPoints
}

function findCurrentUser(preparedEntries, authUser) {
  if (!authUser) {
    return preparedEntries.find((entry) => entry.name === 'You') ?? null
  }

  const authId = authUser.id ?? authUser._id

  return (
    preparedEntries.find((entry) => authId != null && entry.id === authId)
    ?? preparedEntries.find((entry) => entry.name.toLowerCase() === authUser.name?.toLowerCase())
    ?? preparedEntries.find((entry) => entry.name === 'You')
    ?? null
  )
}

function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 65,
    origin: { y: 0.7 },
  })
}

function LeaderboardPage() {
  const { user } = useAuth()
  const [subject, setSubject] = useState('All')
  const [timeRange, setTimeRange] = useState('weekly')
  const [currentPage, setCurrentPage] = useState(1)
  const hasFiredRef = useRef(false)

  const handleSubjectChange = (value) => {
    setSubject(value)
    setCurrentPage(1)
    hasFiredRef.current = false
  }

  const handleTimeRangeChange = (value) => {
    setTimeRange(value)
    setCurrentPage(1)
    hasFiredRef.current = false
  }

  const prepared = useMemo(() => {
    const filtered = leaderboardMock.filter((entry) => {
      if (subject === 'All') return true
      return entry.subject === subject
    })

    const sorted = [...filtered]
      .sort((a, b) => selectPointsByRange(b, timeRange) - selectPointsByRange(a, timeRange))
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        points: selectPointsByRange(entry, timeRange),
        initials: toInitials(entry.name),
      }))

    return sorted
  }, [subject, timeRange])

  const totalPages = Math.ceil(prepared.length / ITEMS_PER_PAGE)
  const pagedRows = prepared.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )
  const topThree = prepared.slice(0, 3)

  const currentUser = findCurrentUser(prepared, user)

  useEffect(() => {
    if (!currentUser || hasFiredRef.current) {
      return
    }

    if (currentUser.rank < currentUser.previousRank) {
      fireConfetti()
      hasFiredRef.current = true
    }
  }, [currentUser])

  return (
    <main className="leaderboard-page">
      <header className="leaderboard-header">
        <h1>Leaderboard</h1>
        <p>Track your weekly climb and challenge the top players.</p>
      </header>

      <LeaderboardFilter
        subject={subject}
        timeRange={timeRange}
        onSubjectChange={handleSubjectChange}
        onTimeRangeChange={handleTimeRangeChange}
      />

      <PodiumDisplay topThree={topThree} />

      <section className="rank-list" aria-label="Leaderboard rank rows">
        <AnimatePresence>
          {pagedRows.map((entry) => (
            <RankRow key={entry.id} user={entry} />
          ))}
        </AnimatePresence>
      </section>

      <section className="pagination" aria-label="Leaderboard pagination">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span className="page-label">Page {currentPage} of {totalPages || 1}</span>
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages || 1, prev + 1))}
          disabled={currentPage === (totalPages || 1)}
        >
          Next
        </button>
      </section>

      <aside className="sticky-rank" aria-label="Your sticky rank bar">
        <div className="sticky-rank__summary">
          <span className="sticky-rank__label">Your position</span>
          <span className="sticky-rank__value">
            {currentUser ? <>Rank <strong>#{currentUser.rank}</strong></> : 'Join the board'}
          </span>
        </div>
        {timeRange === 'weekly' && (
          <span
            className={`sticky-rank__trend ${currentUser?.weeklyChange > 0 ? 'delta-up' : currentUser?.weeklyChange < 0 ? 'delta-down' : 'delta-flat'}`}
          >
            {currentUser
              ? currentUser.weeklyChange > 0
                ? `Climbed ${currentUser.weeklyChange} this week`
                : currentUser.weeklyChange < 0
                  ? `Down ${Math.abs(currentUser.weeklyChange)} this week`
                  : 'Holding steady this week'
              : 'Complete quizzes to earn your place'}
          </span>
        )}
      </aside>
    </main>
  )
}

export default LeaderboardPage
