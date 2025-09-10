const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  // Question content
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'rating', 'preference-ranking', 'scenario'],
    default: 'multiple-choice'
  },
  
  // Answer options
  options: [{
    text: String,
    value: Number, // Scoring weight for this option
    tags: [String] // Tags associated with selecting this option
  }],
  
  // For rating type questions (1-5 scale, etc.)
  ratingScale: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 5
    },
    labels: {
      minLabel: String, // e.g., "Strongly Disagree"
      maxLabel: String  // e.g., "Strongly Agree"
    }
  },
  
  // Tag-based categorization system
  primaryTags: [{
    type: String,
    required: true
    // Examples: 'logical-thinking', 'creativity', 'leadership', 'technical-skills', 
    // 'communication', 'problem-solving', 'science-interest', 'arts-interest', etc.
  }],
  
  // Subject/Stream associations
  streamRelevance: [{
    stream: {
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Vocational']
    },
    weight: {
      type: Number,
      min: 0,
      max: 1 // How relevant this question is to the stream
    }
  }],
  
  // Career field associations
  careerFields: [{
    field: String, // e.g., 'Engineering', 'Medicine', 'Business', 'Design'
    relevance: Number // 0-1 scale
  }],
  
  // Question metadata
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['aptitude', 'interest', 'personality', 'values', 'skills'],
    required: true
  },
  
  // Usage tracking
  timesUsed: {
    type: Number,
    default: 0
  },
  averageResponseTime: {
    type: Number, // in seconds
    default: 0
  },
  
  // Question validation
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  lastReviewed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure question integrity
questionSchema.pre('save', function(next) {
  // Ensure at least one primary tag
  if (!this.primaryTags || this.primaryTags.length === 0) {
    return next(new Error('Question must have at least one primary tag'));
  }
  
  // Validate options for multiple choice questions
  if (this.questionType === 'multiple-choice') {
    if (!this.options || this.options.length < 2) {
      return next(new Error('Multiple choice questions must have at least 2 options'));
    }
  }
  
  next();
});

// Indexes for efficient querying
questionSchema.index({ primaryTags: 1 });
questionSchema.index({ category: 1 });
questionSchema.index({ 'streamRelevance.stream': 1 });
questionSchema.index({ isActive: 1 });

// Static method to get questions by tags
questionSchema.statics.findByTags = function(tags, limit = 10) {
  return this.find({
    primaryTags: { $in: tags },
    isActive: true
  }).limit(limit);
};

// Static method to get balanced quiz questions
questionSchema.statics.getBalancedQuiz = function(categories, questionsPerCategory = 5) {
  const pipeline = [
    { $match: { isActive: true } },
    { $group: { 
      _id: '$category',
      questions: { $push: '$$ROOT' }
    }},
    { $project: {
      category: '$_id',
      questions: { $slice: ['$questions', questionsPerCategory] }
    }}
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Question', questionSchema);
