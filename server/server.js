require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require ('helmet')
const morgan= require('morgan')

const connectDB = require('./config/db')
const app = express()
connectDB()

app.use(helmet())
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
)
app.use(express.json())
app.use(morgan('dev'))
app.get('/api/health', (req, res) => {
     res.json({
    status: 'ok',
    timestamp: Date.now() 
  })
})
app.use('/api/auth', require('./routes/auth'))
app.use('/api/quizzes', require('./routes/quiz'))
app.use('/api/badges',      require('./routes/badges'))
app.use('/api/leaderboard', require('./routes/leaderboard'))
app.use('/api/users',       require('./routes/stats'))
app.use('/api/ai',          require('./routes/ai'))

app.use((err, req, res, next) => {
    console.error(err.stack)
     res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server'
  })
})
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  })
})
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})