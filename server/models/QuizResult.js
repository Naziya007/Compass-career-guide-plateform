const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  // User who took the quiz
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Quiz session info
  quizType: {
    type: String,
    enum: ['aptitude', 'interest', 'personality', 'comprehensive', 'retake'],
    default: 'comprehensive'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  totalTimeSpent: {
    type: Number, // in minutes
    required: true
  },
  
  // Individual question responses
  responses: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      text: String,
      value: Number,
      tags: [String] // Tags from the selected option
    },
    responseTime: Number, // in seconds
    wasSkipped: {
      type: Boolean,
      default: false
    }
  }],
  
  // Calculated tag scores based on responses
  tagScores: [{
    tag: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    questionsContributed: Number // How many questions contributed to this score
  }],
  
  // Stream recommendations based on tag analysis
  streamRecommendations: [{
    stream: {
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Vocational'],
      required: true
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    topContributingTags: [{
      tag: String,
      contribution: Number // Percentage contribution to this stream score
    }],
    recommendedCourses: [String] // Specific courses within this stream
  }],
  
  // Career field compatibility
  careerCompatibility: [{
    field: String, // e.g., 'Engineering', 'Medicine', 'Business'
    compatibility: {
      type: Number,
      min: 0,
      max: 100
    },
    matchingTags: [String],
    suggestedRoles: [String] // Specific job roles within the field
  }],
  
  // Overall quiz insights
  insights: {
    topStrengths: [String], // Top 5 strength areas
    areasForExploration: [String], // Areas with moderate interest
    personalityTraits: [String], // Key personality indicators
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'mixed']
    }
  },
  
  // Comparison with peers (aggregate data)
  peerComparison: {
    ageGroup: String, // e.g., '16-18'
    classLevel: String, // e.g., '12th'
    percentileRanks: [{
      tag: String,
      percentile: Number // 0-100, where user ranks compared to peers
    }]
  },
  
  // Result metadata
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  wasCompleted: {
    type: Boolean,
    default: true
  },
  resultsShared: {
    type: Boolean,
    default: false
  },
  
  // For future features
  mentorReviewRequested: {
    type: Boolean,
    default: false
  },
  geminiAnalysisGenerated: {
    type: Boolean,
    default: false
  },
  geminiInsights: {
    careerSuggestions: String,
    educationPath: String,
    skillsToFocus: [String]
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
quizResultSchema.index({ userId: 1, createdAt: -1 });
quizResultSchema.index({ 'tagScores.tag': 1 });
quizResultSchema.index({ quizType: 1 });
quizResultSchema.index({ wasCompleted: 1 });

// Method to calculate overall stream preference
quizResultSchema.methods.getTopStream = function() {
  if (!this.streamRecommendations || this.streamRecommendations.length === 0) {
    return null;
  }
  
  return this.streamRecommendations.reduce((top, current) => 
    current.score > (top?.score || 0) ? current : top
  );
};

// Method to get top career matches
quizResultSchema.methods.getTopCareers = function(limit = 5) {
  if (!this.careerCompatibility) return [];
  
  return this.careerCompatibility
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, limit);
};

// Static method to get user's quiz history
quizResultSchema.statics.getUserHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('responses.questionId', 'questionText category primaryTags');
};

// Static method for analytics - get tag distribution across users
quizResultSchema.statics.getTagAnalytics = function() {
  return this.aggregate([
    { $unwind: '$tagScores' },
    { $group: {
      _id: '$tagScores.tag',
      averageScore: { $avg: '$tagScores.score' },
      count: { $sum: 1 },
      maxScore: { $max: '$tagScores.score' },
      minScore: { $min: '$tagScores.score' }
    }},
    { $sort: { averageScore: -1 } }
  ]);
};

module.exports = mongoose.model('QuizResult', quizResultSchema);
