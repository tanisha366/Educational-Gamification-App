# API Documentation — Dynamic Gamification
Base URL (Local): http://localhost:5000
Base URL (Production): https://your-render-url.onrender.com

All protected routes require:
Header: Authorization: Bearer <token>

All responses follow this format:
Success: { "success": true, "data": {...} }
Error:   { "success": false, "message": "..." }

---

## AUTH ROUTES

### POST /api/auth/register
Auth Required: No

Request Body:
{
  "name": "Archana",
  "email": "archana@test.com",
  "password": "test123"
}

Success Response (201):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "664abc123",
      "name": "Archana",
      "email": "archana@test.com",
      "totalPoints": 0,
      "currentStreak": 0,
      "role": "student"
    }
  }
}

Error Responses:
400 - { "success": false, "message": "An account with this email already exists." }
422 - { "success": false, "message": "Validation failed", "errors": [...] }
500 - { "success": false, "message": "Server error during registration." }

---

### POST /api/auth/login
Auth Required: No

Request Body:
{
  "email": "archana@test.com",
  "password": "test123"
}

Success Response (200):
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "664abc123",
      "name": "Archana",
      "email": "archana@test.com",
      "totalPoints": 150,
      "currentStreak": 3,
      "role": "student"
    }
  }
}

Error Responses:
401 - { "success": false, "message": "Invalid email or password." }
422 - { "success": false, "message": "Validation failed", "errors": [...] }

---

### GET /api/auth/me
Auth Required: Yes

Success Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "664abc123",
      "name": "Archana",
      "email": "archana@test.com",
      "totalPoints": 150,
      "currentStreak": 3,
      "role": "student",
      "lastActiveDate": "2026-04-25T00:00:00.000Z",
      "createdAt": "2026-04-17T00:00:00.000Z"
    }
  }
}

Error Responses:
401 - { "success": false, "message": "Access denied. No token provided." }
404 - { "success": false, "message": "User not found." }

---

## QUIZ ROUTES

### GET /api/quizzes
Auth Required: Yes

Query Params (all optional):
- subject: Math | Science | English | History | General
- difficulty: easy | medium | hard

Example: GET /api/quizzes?subject=Math&difficulty=easy

Success Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "664xyz789",
      "title": "Algebra Basics",
      "subject": "Math",
      "difficulty": "easy",
      "questionCount": 5,
      "estimatedMinutes": 3
    }
  ]
}

---

### GET /api/quizzes/:id
Auth Required: Yes

Example: GET /api/quizzes/664xyz789

Success Response (200):
{
  "success": true,
  "data": {
    "_id": "664xyz789",
    "title": "Algebra Basics",
    "subject": "Math",
    "difficulty": "easy",
    "questions": [
      {
        "_id": "q1id",
        "questionText": "Solve for x: 2x + 3 = 7",
        "timeLimitSeconds": 30,
        "options": [
          { "_id": "o1id", "text": "x = 2", "originalIndex": 0 },
          { "_id": "o2id", "text": "x = 1", "originalIndex": 1 },
          { "_id": "o3id", "text": "x = 3", "originalIndex": 2 },
          { "_id": "o4id", "text": "x = 4", "originalIndex": 3 }
        ]
      }
    ]
  }
}

Note: Options are shuffled on every request.
Note: isCorrect is NOT included — answer checking happens server-side on submit.

Error Responses:
400 - { "success": false, "message": "Invalid quiz ID format" }
404 - { "success": false, "message": "Quiz not found" }

---

### POST /api/quizzes/:id/submit
Auth Required: Yes

Request Body:
{
  "answers": [
    { "questionId": "q1id", "selectedOptionIndex": 0 },
    { "questionId": "q2id", "selectedOptionIndex": 2 },
    { "questionId": "q3id", "selectedOptionIndex": 1 },
    { "questionId": "q4id", "selectedOptionIndex": 3 },
    { "questionId": "q5id", "selectedOptionIndex": 0 }
  ],
  "timeTakenSeconds": 87
}

Success Response (200):
{
  "success": true,
  "data": {
    "score": 80,
    "correctCount": 4,
    "totalQuestions": 5,
    "pointsEarned": 75,
    "newTotalPoints": 225,
    "correctAnswers": [
      { "questionId": "q1id", "selectedOptionIndex": 0, "isCorrect": true, "correctIndex": 0 },
      { "questionId": "q2id", "selectedOptionIndex": 2, "isCorrect": false, "correctIndex": 1 }
    ],
    "newBadges": [
      {
        "_id": "b1id",
        "name": "First Step",
        "description": "Complete your first quiz",
        "iconName": "star",
        "rarity": "common"
      }
    ]
  }
}

Note: newBadges array is empty [] if no new badge was earned.
Note: Points system — 90-100% = 100pts, 70-89% = 75pts, 50-69% = 50pts, below 50% = 25pts

---

## BADGE ROUTES

### GET /api/badges
Auth Required: Yes

Success Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "b1id",
      "name": "First Step",
      "description": "Complete your first quiz",
      "iconName": "star",
      "rarity": "common",
      "requirement": { "type": "quizCount", "value": 1 },
      "earned": true,
      "earnedAt": "2026-04-25T10:30:00.000Z"
    },
    {
      "_id": "b2id",
      "name": "Sharp Mind",
      "description": "Score 100% on any quiz",
      "iconName": "lightning",
      "rarity": "rare",
      "requirement": { "type": "perfectScore", "value": 100 },
      "earned": false,
      "earnedAt": null
    }
  ]
}

---

## LEADERBOARD ROUTES

### GET /api/leaderboard
Auth Required: Yes

Query Params (all optional):
- subject: Math | Science | English | History | General
- period: weekly | monthly (default = all time)
- page: number (default = 1)
- limit: number (default = 10)

Example: GET /api/leaderboard?period=weekly&page=1&limit=10

Success Response (200) — Global:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "_id": "u1id",
      "name": "Archana",
      "totalPoints": 500,
      "currentStreak": 5,
      "badgesEarned": 3,
      "isCurrentUser": true
    },
    {
      "rank": 2,
      "_id": "u2id",
      "name": "Nimrit",
      "totalPoints": 400,
      "currentStreak": 2,
      "badgesEarned": 2,
      "isCurrentUser": false
    }
  ],
  "total": 25,
  "page": 1,
  "totalPages": 3
}

Success Response (200) — Subject filtered:
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "_id": "u1id",
      "name": "Archana",
      "totalPoints": 200,
      "quizzesCompleted": 3,
      "avgScore": 85.5,
      "isCurrentUser": true
    }
  ],
  "page": 1,
  "subject": "Math"
}

---

## STATS ROUTES

### GET /api/users/me/stats
Auth Required: Yes

Success Response (200):
{
  "success": true,
  "data": {
    "totalPoints": 225,
    "quizzesCompleted": 3,
    "currentStreak": 2,
    "badgesEarned": 1,
    "scoresByDate": [
      { "date": "2026-04-19", "score": 0 },
      { "date": "2026-04-20", "score": 0 },
      { "date": "2026-04-21", "score": 0 },
      { "date": "2026-04-22", "score": 75 },
      { "date": "2026-04-23", "score": 80 },
      { "date": "2026-04-24", "score": 0 },
      { "date": "2026-04-25", "score": 90 }
    ],
    "scoresBySubject": {
      "Math": 85,
      "Science": 70,
      "English": 90,
      "History": 0,
      "General": 0
    },
    "recentAttempts": [
      {
        "quizTitle": "Algebra Basics",
        "subject": "Math",
        "score": 90,
        "completedAt": "2026-04-25T10:30:00.000Z"
      }
    ]
  }
}

---

## AI ROUTES

### POST /api/ai/suggestions
Auth Required: Yes

Request Body: (empty — user data read from JWT)
{}

Success Response (200):
{
  "success": true,
  "data": [
    {
      "topic": "Algebra Word Problems",
      "reason": "Your Math score is below average and needs improvement.",
      "priority": "high",
      "estimatedDifficulty": "easy",
      "subject": "Math"
    },
    {
      "topic": "Cell Biology Basics",
      "reason": "Science is your second weakest subject this week.",
      "priority": "medium",
      "estimatedDifficulty": "easy",
      "subject": "Science"
    },
    {
      "topic": "Grammar and Punctuation",
      "reason": "Consistent practice in English will improve your streak.",
      "priority": "low",
      "estimatedDifficulty": "easy",
      "subject": "English"
    }
  ]
}

Note: If AI is unavailable, fallback suggestions are returned automatically.
Note: Rate limited to 5 requests per 15 minutes.

---

## ERROR CODES REFERENCE

| Code | Meaning |
|------|---------|
| 200  | OK — request successful |
| 201  | Created — new resource created |
| 400  | Bad Request — invalid data sent |
| 401  | Unauthorized — no token or invalid token |
| 404  | Not Found — resource doesn't exist |
| 422  | Unprocessable — validation failed |
| 429  | Too Many Requests — rate limit hit |
| 500  | Server Error — something broke on backend |

---

## FRONTEND USAGE NOTES

### How to send token (use api.js — never use fetch directly):
import api from '../utils/api'

GET:  const { data } = await api.get('/quizzes')
POST: const { data } = await api.post('/quizzes/' + id + '/submit', { answers })

### Token storage:
- Save token to localStorage on login/register
- api.js automatically adds it to every request header

### Field names — use EXACTLY these:
user.totalPoints       (not user.points)
user.currentStreak     (not user.streak)
attempt.score          (0-100, percentage)
attempt.pointsEarned   (25/50/75/100)
badge.iconName         (matches SVG component names)
badge.earned           (boolean)
badge.earnedAt         (Date or null)