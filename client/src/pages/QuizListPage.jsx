import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import './DashboardPage.css' // Reusing some dashboard styles for consistency

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState({ subject: '', difficulty: '' })

  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filter.subject) params.subject = filter.subject
      if (filter.difficulty) params.difficulty = filter.difficulty

      const { data } = await api.get('/api/quizzes', { params })
      setQuizzes(data.data || [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load quizzes.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  const subjects = ['Math', 'Science', 'English', 'History', 'General']
  const difficulties = ['easy', 'medium', 'hard']

  return (
    <div className="dashboard" style={{ padding: '88px 32px' }}>
      <Helmet>
        <title>LearnQuest — Quizzes</title>
      </Helmet>
      
      <div className="dashboard__header">
        <div>
          <h1>Available Quizzes</h1>
          <p className="dashboard__headerSub">Choose a subject and test your knowledge!</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <select 
          value={filter.subject} 
          onChange={(e) => setFilter({ ...filter, subject: e.target.value })}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          <option value="">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select 
          value={filter.difficulty} 
          onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
          style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          <option value="">All Difficulties</option>
          {difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
      </div>

      {error && (
        <Card className="dashboard__error">
          <div className="dashboard__errorMsg">{error}</div>
          <Button variant="ghost" onClick={fetchQuizzes}>Retry</Button>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <Skeleton height="20px" width="70%" />
              <div style={{ marginTop: '12px' }}><Skeleton height="14px" width="40%" /></div>
              <div style={{ marginTop: '20px' }}><Skeleton height="36px" width="100%" /></div>
            </Card>
          ))
        ) : quizzes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No quizzes found matching your filters.
          </div>
        ) : (
          quizzes.map(quiz => (
            <Card key={quiz._id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--primary)' }}>{quiz.subject}</span>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: '700', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    background: quiz.difficulty === 'easy' ? 'var(--success-bg)' : quiz.difficulty === 'medium' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                    color: quiz.difficulty === 'easy' ? 'var(--success)' : quiz.difficulty === 'medium' ? 'var(--warning)' : 'var(--danger)'
                  }}>
                    {quiz.difficulty.toUpperCase()}
                  </span>
                </div>
                <h3 style={{ marginBottom: '8px' }}>{quiz.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {quiz.questionCount} Questions • Approx. {quiz.estimatedMinutes} mins
                </p>
              </div>
              <Link to={`/quiz/${quiz._id}`} style={{ textDecoration: 'none' }}>
                <Button width="100%">Start Quiz</Button>
              </Link>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
