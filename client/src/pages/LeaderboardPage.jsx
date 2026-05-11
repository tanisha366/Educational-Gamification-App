import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { AnimatePresence } from 'framer-motion'
import api from '../utils/api'
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
  if (!authUser) return null

  const authId = authUser.id ?? authUser._id

  return (
    preparedEntries.find((entry) => entry.isCurrentUser === true)
    ?? preparedEntries.find((entry) => authId != null && entry._id === authId)
    ?? preparedEntries.find((entry) => entry.name.toLowerCase() === authUser.name?.toLowerCase())
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
  const [timeRange, setTimeRange] = useState('all-time')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [loading, setLoading] = useState(true)
  const hasFiredRef = useRef(false)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      }
      if (subject !== 'All') params.subject = subject
      if (timeRange !== 'all-time') params.period = timeRange

      const { data } = await api.get('/api/leaderboard', { params })
      setLeaderboardData(data.data || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, subject, timeRange])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

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
    return leaderboardData.map((entry) => ({
      ...entry,
      id: entry._id || entry.id,
      points: entry.totalPoints ?? 0,
      initials: toInitials(entry.name),
    }))
  }, [leaderboardData])

  const topThree = useMemo(() => {
    if (currentPage === 1) return prepared.slice(0, 3)
    return []
  }, [prepared, currentPage])

  const currentUser = useMemo(() => findCurrentUser(prepared, user), [prepared, user])

  useEffect(() => {
    if (!currentUser || hasFiredRef.current) return

    // Previous rank is not always available from backend, so we might need to skip this
    // or handle it if the backend provides it.
    if (currentUser.rank < (currentUser.previousRank || 100)) {
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

      {currentPage === 1 && topThree.length > 0 && <PodiumDisplay topThree={topThree} />}

      <section className="rank-list" aria-label="Leaderboard rank rows">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading leaderboard...</div>
        ) : (
          <AnimatePresence>
            {prepared.map((entry) => (
              <RankRow key={entry.id} user={entry} />
            ))}
          </AnimatePresence>
        )}
        {!loading && prepared.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No entries found for this category.</div>
        )}
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
