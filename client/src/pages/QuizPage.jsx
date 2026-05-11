import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import api from '../utils/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

export default function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(Date.now())

  const fetchQuiz = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/api/quizzes/${id}`)
      setQuiz(data.data)
      if (data.data.questions?.length > 0) {
        setTimeLeft(data.data.questions[0].timeLimitSeconds || 30)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load quiz.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion() // Auto-advance on timeout
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [currentQuestionIndex])

  useEffect(() => {
    if (quiz && !result && !isSubmitting) {
      startTimer()
    }
    return () => clearInterval(timerRef.current)
  }, [quiz, currentQuestionIndex, result, isSubmitting, startTimer])

  const handleOptionSelect = (optionIndex) => {
    if (result) return
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex
    })
  }

  const handleNextQuestion = () => {
    if (!quiz) return
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setTimeLeft(quiz.questions[currentQuestionIndex + 1].timeLimitSeconds || 30)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || result) return
    setIsSubmitting(true)
    clearInterval(timerRef.current)
    
    const timeTakenSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
    
    const answers = quiz.questions.map((q, idx) => ({
      questionId: q._id,
      selectedOptionIndex: selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : -1
    }))

    try {
      const { data } = await api.post(`/api/quizzes/${id}/submit`, {
        answers,
        timeTakenSeconds
      })
      setResult(data.data)
      refreshUser() // Update user points in context
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit quiz.')
      setIsSubmitting(false)
    }
  }

  if (loading) return (
    <div className="dashboard" style={{ padding: '88px 32px' }}>
      <Card><Skeleton height="30px" width="60%" /><div style={{ marginTop: 20 }}><Skeleton height="200px" /></div></Card>
    </div>
  )

  if (error && !result) return (
    <div className="dashboard" style={{ padding: '88px 32px' }}>
      <Card className="dashboard__error">
        <p>{error}</p>
        <Button onClick={() => navigate('/quiz')}>Back to Quizzes</Button>
      </Card>
    </div>
  )

  if (result) {
    return (
      <div className="dashboard" style={{ padding: '88px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <Helmet><title>Quiz Results — LearnQuest</title></Helmet>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <h1 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Quiz Completed!</h1>
          <div style={{ fontSize: '48px', fontWeight: '900', margin: '20px 0' }}>{result.score}%</div>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>
            You got <strong>{result.correctCount}</strong> out of <strong>{result.totalQuestions}</strong> questions correct.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div style={{ padding: '20px', background: 'var(--bg-offset)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Points Earned</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>+{result.pointsEarned} XP</div>
            </div>
            <div style={{ padding: '20px', background: 'var(--bg-offset)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>New Total</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{result.newTotalPoints} XP</div>
            </div>
          </div>

          {result.newBadges?.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '15px' }}>🏆 New Badges Unlocked!</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                {result.newBadges.map(badge => (
                  <div key={badge._id} title={badge.description} style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--gold-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '8px' }}>
                      ✨
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700' }}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Button onClick={() => navigate('/quiz')} variant="ghost">All Quizzes</Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="dashboard" style={{ padding: '88px 32px', maxWidth: '800px', margin: '0 auto' }}>
      <Helmet><title>{quiz.title} — LearnQuest</title></Helmet>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase' }}>{quiz.subject}</span>
          <h2 style={{ margin: '4px 0' }}>{quiz.title}</h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: timeLeft < 10 ? 'var(--danger)' : 'var(--text-primary)' 
          }}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--bg-offset)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', 
          background: 'var(--primary)', 
          width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>

      <Card style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '24px', lineHeight: '1.4' }}>{currentQuestion.questionText}</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={option._id}
              onClick={() => handleOptionSelect(index)}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: selectedAnswers[currentQuestionIndex] === index 
                  ? '2px solid var(--primary)' 
                  : '1px solid var(--border)',
                background: selectedAnswers[currentQuestionIndex] === index 
                  ? 'var(--primary-bg)' 
                  : 'var(--bg-card)',
                color: 'var(--text-primary)',
                textAlign: 'left',
                fontSize: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                background: selectedAnswers[currentQuestionIndex] === index ? 'var(--primary)' : 'transparent',
                color: selectedAnswers[currentQuestionIndex] === index ? 'white' : 'var(--primary)'
              }}>
                {String.fromCharCode(65 + index)}
              </div>
              {option.text}
            </button>
          ))}
        </div>

        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleNextQuestion} 
            disabled={selectedAnswers[currentQuestionIndex] === undefined || isSubmitting}
            loading={isSubmitting}
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
