const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic authentication info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Profile information for personalization
  profile: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      min: 13,
      max: 100
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    class: {
      type: String,
      enum: ['10th', '11th', '12th', 'graduate', 'postgraduate']
    },
    location: {
      state: String,
      city: String,
      pincode: String
    }
  },
  
  // Quiz and assessment data
  quizHistory: [{
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizResult'
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Interest tags from quiz results
  interestTags: [{
    tag: String,
    score: Number, // 0-100 strength of interest
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recommended courses and career paths
  recommendations: {
    courses: [{
      course: String,
      stream: {
        type: String,
        enum: ['Science', 'Commerce', 'Arts', 'Vocational']
      },
      confidence: Number, // 0-100 confidence score
      reasons: [String], // Why this was recommended
      geminiSuggestion: Boolean // Whether this came from Gemini API
    }],
    careerPaths: [{
      career: String,
      industry: String,
      compatibility: Number, // 0-100 compatibility score
      educationPath: [String], // Required education steps
      geminiAnalysis: String // AI-generated career analysis
    }],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // User preferences
  preferences: {
    preferredLanguage: {
      type: String,
      default: 'english'
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    shareDataWithMentors: {
      type: Boolean,
      default: false // For future mentor connect feature
    }
  },
  
  // Account metadata
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  accountCreated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ 'profile.class': 1 });
userSchema.index({ 'interestTags.tag': 1 });

module.exports = mongoose.model('User', userSchema);
