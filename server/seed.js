require('dotenv').config()
const mongoose = require('mongoose')
const Quiz = require('./models/Quiz')
const Badge = require('./models/Badge')

const quizzes = [
  {
    title: 'Algebra Basics',
    subject: 'Math',
    difficulty: 'easy',
    isPublished: true,
    questions: [
      {
        questionText: 'Solve for x: 2x + 3 = 7',
        options: [
          { text: 'x = 1', isCorrect: false },
          { text: 'x = 2', isCorrect: true },
          { text: 'x = 3', isCorrect: false },
          { text: 'x = 4', isCorrect: false }
        ]
      },
      {
        questionText: 'What is the square root of 144?',
        options: [
          { text: '11', isCorrect: false },
          { text: '13', isCorrect: false },
          { text: '12', isCorrect: true },
          { text: '14', isCorrect: false }
        ]
      },
      {
        questionText: 'Simplify: 3(x + 4)',
        options: [
          { text: '3x + 4', isCorrect: false },
          { text: '3x + 7', isCorrect: false },
          { text: '3x + 12', isCorrect: true },
          { text: '7x', isCorrect: false }
        ]
      },
      {
        questionText: 'What is 5² − 3²?',
        options: [
          { text: '4',  isCorrect: false },
          { text: '16', isCorrect: true },
          { text: '34', isCorrect: false },
          { text: '8',  isCorrect: false }
        ]
      },
      {
        questionText: 'If y = 2x and x = 5, what is y?',
        options: [
          { text: '7',  isCorrect: false },
          { text: '3',  isCorrect: false },
          { text: '25', isCorrect: false },
          { text: '10', isCorrect: true }
        ]
      }
    ]
  },
  {
    title: 'Human Body Systems',
    subject: 'Science',
    difficulty: 'medium',
    isPublished: true,
    questions: [
      {
        questionText: 'Which organ pumps blood through the body?',
        options: [
          { text: 'Liver',  isCorrect: false },
          { text: 'Kidney', isCorrect: false },
          { text: 'Heart',  isCorrect: true },
          { text: 'Lung',   isCorrect: false }
        ]
      },
      {
        questionText: 'What is the powerhouse of the cell?',
        options: [
          { text: 'Nucleus',     isCorrect: false },
          { text: 'Ribosome',    isCorrect: false },
          { text: 'Vacuole',     isCorrect: false },
          { text: 'Mitochondria',isCorrect: true }
        ]
      },
      {
        questionText: 'How many bones are in the adult human body?',
        options: [
          { text: '186', isCorrect: false },
          { text: '206', isCorrect: true },
          { text: '256', isCorrect: false },
          { text: '196', isCorrect: false }
        ]
      },
      {
        questionText: 'Which blood type is the universal donor?',
        options: [
          { text: 'A+',  isCorrect: false },
          { text: 'AB+', isCorrect: false },
          { text: 'B+',  isCorrect: false },
          { text: 'O−',  isCorrect: true }
        ]
      },
      {
        questionText: 'What is the largest organ in the human body?',
        options: [
          { text: 'Liver',     isCorrect: false },
          { text: 'Brain',     isCorrect: false },
          { text: 'Skin',      isCorrect: true },
          { text: 'Intestine', isCorrect: false }
        ]
      }
    ]
  },
  {
    title: 'English Grammar',
    subject: 'English',
    difficulty: 'easy',
    isPublished: true,
    questions: [
      {
        questionText: 'Which sentence is grammatically correct?',
        options: [
          { text: 'She go to school.',     isCorrect: false },
          { text: 'She goes to school.',   isCorrect: true },
          { text: 'She going to school.',  isCorrect: false },
          { text: 'She gone to school.',   isCorrect: false }
        ]
      },
      {
        questionText: 'What is the plural of "child"?',
        options: [
          { text: 'Childs',    isCorrect: false },
          { text: 'Childrens', isCorrect: false },
          { text: 'Children',  isCorrect: true },
          { text: 'Childes',   isCorrect: false }
        ]
      },
      {
        questionText: 'Which word is a noun?',
        options: [
          { text: 'Run',       isCorrect: false },
          { text: 'Beautiful', isCorrect: false },
          { text: 'Quickly',   isCorrect: false },
          { text: 'Happiness', isCorrect: true }
        ]
      },
      {
        questionText: 'Identify the verb: "The dog barked loudly."',
        options: [
          { text: 'dog',    isCorrect: false },
          { text: 'loudly', isCorrect: false },
          { text: 'The',    isCorrect: false },
          { text: 'barked', isCorrect: true }
        ]
      },
      {
        questionText: 'What punctuation ends a question?',
        options: [
          { text: 'Period (.)',        isCorrect: false },
          { text: 'Comma (,)',         isCorrect: false },
          { text: 'Exclamation (!)',   isCorrect: false },
          { text: 'Question mark (?)', isCorrect: true }
        ]
      }
    ]
  }
]

const badges = [
  {
    name: 'First Step',
    description: 'Complete your first quiz',
    iconName: 'star',
    rarity: 'common',
    requirement: { type: 'quizCount', value: 1 }
  },
  {
    name: 'Getting Good',
    description: 'Complete 5 quizzes',
    iconName: 'stack',
    rarity: 'common',
    requirement: { type: 'quizCount', value: 5 }
  },
  {
    name: 'Sharp Mind',
    description: 'Score 100% on any quiz',
    iconName: 'lightning',
    rarity: 'rare',
    requirement: { type: 'perfectScore', value: 100 }
  },
  {
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    iconName: 'flame',
    rarity: 'rare',
    requirement: { type: 'streak', value: 3 }
  },
  {
    name: 'Night Owl',
    description: 'Complete a quiz after 10 PM',
    iconName: 'moon',
    rarity: 'epic',
    requirement: { type: 'timeOfDay', value: 22 }
  },
  {
    name: 'Legend',
    description: 'Complete 20 quizzes',
    iconName: 'crown',
    rarity: 'legendary',
    requirement: { type: 'quizCount', value: 20 }
  }
]

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB...')

    await Quiz.deleteMany()
    await Badge.deleteMany()
    console.log('Old data cleared...')

    await Quiz.insertMany(quizzes)
    await Badge.insertMany(badges)

    console.log('Seed complete!')
    console.log('   3 quizzes inserted')
    console.log('   6 badges inserted')

    process.exit(0) // success exit

  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1) // error exit
  }
}

seedDB()