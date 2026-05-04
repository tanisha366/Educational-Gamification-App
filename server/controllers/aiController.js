const User = require('../models/User')
const QuizAttempt = require('../models/QuizAttempt')

exports.getSuggestions = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId)

    const attempts = await QuizAttempt.find({ userId })
      .sort({ completedAt: -1 })
      .limit(20)

    const subjects = ['Math', 'Science', 'English', 'History', 'General']
    const scoresBySubject = {}
    for (const subject of subjects) {
      const subAttempts = attempts.filter(a => a.subject === subject)
      scoresBySubject[subject] = subAttempts.length
        ? Math.round(subAttempts.reduce((sum, a) => sum + a.score, 0) / subAttempts.length)
        : 0
    }

    const recentQuizzes = attempts.slice(0, 5).map(a => ({
      subject: a.subject,
      score: a.score,
      completedAt: a.completedAt
    }))

    // Gemini API call
    const prompt = `You are an educational AI tutor for school students.
Analyze this student performance data and suggest exactly 3 quiz topics to improve weak areas.
Return ONLY a valid JSON array. No markdown, no explanation, no extra text.
Each element must have exactly these fields:
- topic (string)
- reason (string, 1 sentence why this helps)
- priority ("high" or "medium" or "low")
- estimatedDifficulty ("easy" or "medium" or "hard")
- subject (one of: Math/Science/English/History/General)

Student data:
Total Points: ${user.totalPoints}
Quizzes Completed: ${attempts.length}
Current Streak: ${user.currentStreak} days
Scores by subject: ${JSON.stringify(scoresBySubject)}
Recent quizzes: ${JSON.stringify(recentQuizzes)}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    )

    const geminiData = await response.json()

    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    rawText = rawText.replace(/```json|```/g, '').trim()

    let suggestions
    try {
      suggestions = JSON.parse(rawText)
      if (!Array.isArray(suggestions) || suggestions.length !== 3) {
        throw new Error('Invalid format')
      }
    } catch {
      suggestions = getFallbackSuggestions(scoresBySubject)
    }

    res.json({
      success: true,
      data: suggestions
    })

  } catch (error) {
    console.error('AI suggestions error:', error)
    res.json({
      success: true,
      data: getFallbackSuggestions({}),
      note: 'Using default suggestions'
    })
  }
}

function getFallbackSuggestions(scoresBySubject) {
  const sorted = Object.entries(scoresBySubject)
    .sort((a, b) => a[1] - b[1])

  const weakSubjects = sorted.length >= 3
    ? sorted.slice(0, 3).map(([sub]) => sub)
    : ['Math', 'Science', 'English']

  return weakSubjects.map((subject, index) => ({
    topic: `${subject} Practice Quiz`,
    reason: `Improving your ${subject} score will boost your overall ranking.`,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    estimatedDifficulty: 'easy',
    subject
  }))
}