const express = require('express');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const router = express.Router();
const auth = require('../middleware/auth'); // Import the auth middleware

// Apply auth middleware to all routes in this file
router.use(auth);

// @route   GET /api/recommendations/:userId
// @desc    Get personalized recommendations for a user
// @access  Private
router.get('/:userId', async (req, res) => {
  try {
    // Security check: ensure the user is the owner of the resource
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(req.params.userId).select('recommendations interestTags profile');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's latest quiz result for additional insights, including Gemini's
    const latestQuizResult = await QuizResult.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select('streamRecommendations careerCompatibility insights geminiInsights'); // Include geminiInsights

    res.json({
      success: true,
      recommendations: user.recommendations,
      interestTags: user.interestTags,
      latestQuizInsights: latestQuizResult?.insights || null,
      geminiInsights: latestQuizResult?.geminiInsights || null, // Include the Gemini insights
      lastUpdated: user.recommendations.lastUpdated
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/recommendations/:userId/refresh
// @desc    Refresh user recommendations based on latest quiz data
// @access  Private
router.post('/:userId/refresh', async (req, res) => {
  try {
    // Security check
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const latestQuiz = await QuizResult.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    if (!latestQuiz) {
      return res.status(400).json({
        success: false,
        message: 'No quiz results found. Please complete a quiz first.'
      });
    }

    user.recommendations.courses = latestQuiz.streamRecommendations.slice(0, 3).map(stream => ({
      course: stream.recommendedCourses[0],
      stream: stream.stream,
      confidence: stream.score,
      reasons: [`Updated based on recent assessment results`],
      geminiSuggestion: false
    }));

    user.recommendations.careerPaths = latestQuiz.careerCompatibility.slice(0, 5).map(career => ({
      career: career.field,
      industry: career.field,
      compatibility: career.compatibility,
      educationPath: [`Bachelor's degree in ${career.field}`, 'Relevant internships', 'Professional certification'],
      geminiAnalysis: `Refreshed recommendation based on your latest aptitude assessment.`
    }));

    user.recommendations.lastUpdated = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Recommendations refreshed successfully',
      recommendations: user.recommendations
    });

  } catch (error) {
    console.error('Error refreshing recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recommendations/:userId/compare-streams
// @desc    Compare different educational streams for the user
// @access  Private
router.get('/:userId/compare-streams', async (req, res) => {
  try {
    // Security check
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const latestQuiz = await QuizResult.findOne({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .select('streamRecommendations tagScores');

    if (!latestQuiz) {
      return res.status(404).json({
        success: false,
        message: 'No quiz results found for comparison'
      });
    }

    const streamComparison = latestQuiz.streamRecommendations.map(stream => ({
      stream: stream.stream,
      score: stream.score,
      strengths: stream.topContributingTags.filter(tag => tag.contribution > 70),
      challenges: stream.topContributingTags.filter(tag => tag.contribution < 50),
      recommendedCourses: stream.recommendedCourses,
      careerProspects: getCareerProspectsForStream(stream.stream),
      averageSalaryRange: getSalaryRangeForStream(stream.stream),
      jobMarketTrend: getJobMarketTrend(stream.stream)
    }));

    res.json({
      success: true,
      streamComparison,
      topRecommendation: streamComparison[0],
      userStrengths: latestQuiz.tagScores.filter(tag => tag.score > 70).map(tag => tag.tag)
    });

  } catch (error) {
    console.error('Error comparing streams:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recommendations/:userId/career-paths/:stream
// @desc    Get detailed career paths for a specific stream
// @access  Private
router.get('/:userId/career-paths/:stream', async (req, res) => {
  try {
    // Security check
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { stream } = req.params;
    const user = await User.findById(req.params.userId).select('interestTags profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const careerPaths = getDetailedCareerPathsForStream(stream, user.interestTags);

    res.json({
      success: true,
      stream,
      careerPaths,
      totalPaths: careerPaths.length
    });

  } catch (error) {
    console.error('Error fetching career paths:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper functions
function getCareerProspectsForStream(stream) {
  const prospects = {
    'Science': ['High demand in technology and healthcare', 'Research opportunities', 'Innovation-driven careers'],
    'Commerce': ['Business leadership roles', 'Financial sector opportunities', 'Entrepreneurship potential'],
    'Arts': ['Creative industry growth', 'Digital media expansion', 'Cultural sector opportunities'],
    'Vocational': ['Skilled trades demand', 'Technical expertise value', 'Industry-specific specialization']
  };
  return prospects[stream] || [];
}

function getSalaryRangeForStream(stream) {
  const salaryRanges = {
    'Science': '₹4-15 LPA (entry to experienced)',
    'Commerce': '₹3-12 LPA (entry to experienced)',
    'Arts': '₹2.5-10 LPA (entry to experienced)',
    'Vocational': '₹2-8 LPA (entry to experienced)'
  };
  return salaryRanges[stream] || 'Varies by specialization';
}

function getJobMarketTrend(stream) {
  const trends = {
    'Science': 'Growing - High demand for STEM professionals',
    'Commerce': 'Stable - Consistent demand across industries',
    'Arts': 'Evolving - Digital transformation creating new opportunities',
    'Vocational': 'Expanding - Increasing appreciation for skilled trades'
  };
  return trends[stream] || 'Varies by field';
}

function getDetailedCareerPathsForStream(stream, userTags) {
  const careerMappings = {
    'Science': [
      {
        title: 'Software Engineering',
        description: 'Develop software applications and systems',
        requiredSkills: ['Programming', 'Problem-solving', 'Logical thinking'],
        educationPath: ['B.Tech/B.E in Computer Science', 'Internships', 'Certifications'],
        averageSalary: '₹6-20 LPA',
        jobRoles: ['Software Developer', 'System Architect', 'Technical Lead'],
        compatibility: calculatePathCompatibility(['logical-thinking', 'technical-skills', 'problem-solving'], userTags)
      },
      {
        title: 'Medical Sciences',
        description: 'Healthcare and medical research',
        requiredSkills: ['Attention to detail', 'Helping others', 'Science knowledge'],
        educationPath: ['MBBS', 'Specialization', 'Medical practice license'],
        averageSalary: '₹8-25 LPA',
        jobRoles: ['Doctor', 'Surgeon', 'Medical Researcher'],
        compatibility: calculatePathCompatibility(['science-interest', 'helping-others', 'attention-to-detail'], userTags)
      }
    ],
    'Commerce': [
      {
        title: 'Business Management',
        description: 'Lead and manage business operations',
        requiredSkills: ['Leadership', 'Communication', 'Analytical thinking'],
        educationPath: ['BBA/B.Com', 'MBA', 'Management experience'],
        averageSalary: '₹5-18 LPA',
        jobRoles: ['Manager', 'Business Analyst', 'Consultant'],
        compatibility: calculatePathCompatibility(['leadership', 'communication', 'analytical-skills'], userTags)
      }
    ],
    'Arts': [
      {
        title: 'Creative Design',
        description: 'Visual and creative content creation',
        requiredSkills: ['Creativity', 'Artistic ability', 'Design thinking'],
        educationPath: ['B.Des/B.F.A', 'Portfolio development', 'Industry projects'],
        averageSalary: '₹3-12 LPA',
        jobRoles: ['Graphic Designer', 'UI/UX Designer', 'Creative Director'],
        compatibility: calculatePathCompatibility(['creativity', 'artistic-ability', 'design-thinking'], userTags)
      }
    ],
    'Vocational': [
      {
        title: 'Technical Trades',
        description: 'Specialized technical and practical skills',
        requiredSkills: ['Technical skills', 'Hands-on learning', 'Problem-solving'],
        educationPath: ['Diploma/ITI', 'Apprenticeship', 'Industry certification'],
        averageSalary: '₹3-10 LPA',
        jobRoles: ['Technician', 'Supervisor', 'Technical Specialist'],
        compatibility: calculatePathCompatibility(['technical-skills', 'hands-on-learning', 'practical-skills'], userTags)
      }
    ]
  };

  return careerMappings[stream] || [];
}

function calculatePathCompatibility(requiredTags, userTags) {
  if (!userTags || userTags.length === 0) return 0;
  
  let totalScore = 0;
  let matchCount = 0;

  requiredTags.forEach(requiredTag => {
    const userTag = userTags.find(tag => tag.tag === requiredTag);
    if (userTag) {
      totalScore += userTag.score;
      matchCount++;
    }
  });

  return matchCount > 0 ? Math.round(totalScore / matchCount) : 0;
}

module.exports = router;
