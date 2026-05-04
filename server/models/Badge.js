const mongoose = require('mongoose')

const BadgeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  iconName:    { type: String },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary']
  },
  requirement: {
    type: {
      type: String,
      enum: ['quizCount', 'perfectScore', 'streak', 'subjectCount', 'timeOfDay']
    },
    value: { type: Number }, 
    subject: { type: String } 
  }
})

module.exports = mongoose.model('Badge', BadgeSchema)