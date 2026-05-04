const mongoose = require('mongoose')

const QuizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  subject: {
    type: String
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    selectedOptionIndex: {
      type: Number
    },
    isCorrect: {
      type: Boolean
    }
  }],
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  timeTakenSeconds: {
    type: Number,
    default: 0
  },

  completedAt: {
    type: Date,
    default: Date.now
  }
})

// Performance indexes
QuizAttemptSchema.index({ userId: 1, completedAt: -1 })
QuizAttemptSchema.index({ userId: 1, subject: 1 })
QuizAttemptSchema.index({ subject: 1, completedAt: -1 })

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema)