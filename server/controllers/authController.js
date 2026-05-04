const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')
const User = require('../models/User')

// ========================================
// HELPER FUNCTION 
// ========================================
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,    
      email: user.email,
      role: user.role  
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN 
    }
  )
}

// ========================================
// REGISTER CONTROLLER
// ========================================
exports.register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array() 
    })
  }
  const { name, email, password } = req.body

  try {
    
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      })
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password 
    })

    const token = generateToken(user)
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          role: user.role
        }
       
      }
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered.'
      })
    }

    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    })
  }
}

// ========================================
// LOGIN CONTROLLER
// ========================================
exports.login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array()
    })
  }

  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.' 
      })
    }

    const token = generateToken(user)
    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          role: user.role
        }
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    })
  }
}
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    res.json({
      success: true,
      data: { user }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error.'
    })
  }
}