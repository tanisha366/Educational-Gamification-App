const mongoose = require('mongoose')
const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false
  }
})

// QuestionSchema 
const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: [OptionSchema],
  timeLimitSeconds: {
    type: Number,
    default: 30
  }
})

// QuizSchema 
const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required']
  },
  subject: {
    type: String,
    enum: ['Math', 'Science', 'English', 'History', 'General'],
    required: true
  },

  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },

  questions: [QuestionSchema],
  isPublished: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Quiz', QuizSchema)