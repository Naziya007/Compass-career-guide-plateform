const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

// Initialize Gemini AI
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// @route   GET /api/quiz/questions
// @desc    Get quiz questions (balanced across categories)
// @access  Public
router.get('/questions', async (req, res) => {
  try {
    const { category, limit = 20, difficulty } = req.query;
    let query = { isActive: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    let questions;
    if (!category) {
      questions = await Question.getBalancedQuiz(['aptitude', 'interest', 'personality'], 7);
      console.log('Aggregated questions:', JSON.stringify(questions, null, 2));
      const flatQuestions = questions.flatMap(cat => cat.questions).slice(0, parseInt(limit));
      console.log('Flat questions:', flatQuestions.length);
      return res.json({ success: true, count: flatQuestions.length, questions: flatQuestions });
    }

    questions = await Question.find(query).limit(parseInt(limit));
    console.log('Filtered questions:', questions.length);
    res.json({ success: true, count: questions.length, questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// @route   POST /api/quiz/submit
// @desc    Submit quiz responses and calculate results
// @access  Private
router.post('/submit', auth, async (req, res) => {
  try {
    const { responses, startTime, endTime, quizType = 'comprehensive' } = req.body;
    const userId = req.user.id;
    if (!userId || !responses || !Array.isArray(responses)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }

    const totalTimeSpent = Math.round((new Date(endTime) - new Date(startTime)) / (1000 * 60));

    const questionIds = responses.map(r => r.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

    const tagScores = {};
    const processedResponses = [];

    for (const response of responses) {
      const question = questionMap.get(response.questionId);
      if (!question) continue;
      const selectedOption = question.options.find(opt => opt.text === response.selectedOption);
      if (!selectedOption) continue;

      selectedOption.tags.forEach(tag => {
        if (!tagScores[tag]) {
          tagScores[tag] = { total: 0, count: 0 };
        }
        tagScores[tag].total += selectedOption.value || 1;
        tagScores[tag].count += 1;
      });

      processedResponses.push({
        questionId: response.questionId,
        selectedOption: {
          text: selectedOption.text,
          value: selectedOption.value,
          tags: selectedOption.tags
        },
        responseTime: response.responseTime || 0,
        wasSkipped: response.wasSkipped || false
      });
      question.timesUsed += 1;
      await question.save();
    }

    
    const normalizedTagScores = Object.keys(tagScores).map(tag => ({
      tag,
      score: Math.min(100, Math.round((tagScores[tag].count / tagScores[tag].total) * 400)),
      questionsContributed: tagScores[tag].count
    }));

    const streamRecommendations = calculateStreamRecommendations(normalizedTagScores);
    const careerCompatibility = calculateCareerCompatibility(normalizedTagScores);
    const insights = generateInsights(normalizedTagScores);

    const quizResult = new QuizResult({
      userId,
      quizType,
      startTime,
      endTime,
      totalTimeSpent,
      responses: processedResponses,
      tagScores: normalizedTagScores,
      streamRecommendations,
      careerCompatibility,
      insights,
      completionPercentage: Math.round((processedResponses.length / questions.length) * 100)
    });

    // Generate Gemini AI Summary
    if (process.env.GEMINI_API_KEY) {
      try {
        // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
        const userStrengths = normalizedTagScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(tag => `${tag.tag.replace('-', ' ')} (${tag.score}%)`);
        
        const topStream = streamRecommendations[0];
        
        const prompt = `
          You are a career guidance counselor. Based on the following assessment data, provide a concise, two-to-three-sentence summary of the user's career aptitude and suggest a suitable course as well.
          
          User Strengths: ${userStrengths.join(', ')}
          Top Recommended Stream: ${topStream?.stream || 'N/A'} with a ${topStream?.score}% match.
          
          Start the summary with a sentence like "You are well-suited for..."
        `;
        async function main() {
          result = await genAI.models.generateContent({
           model: "gemini-2.5-flash",
           contents: prompt,
        });
        const geminiSummary = result?.text;
        quizResult.geminiInsights.careerSuggestions = geminiSummary;
        quizResult.geminiAnalysisGenerated = true;
        await quizResult.save();
      }
      main()
      
    } catch (geminiError) {
      console.error('Error calling Gemini API:', geminiError);
      quizResult.geminiInsights.careerSuggestions = 'Could not generate AI summary at this time.';
      quizResult.geminiAnalysisGenerated = false;
    }
  }
  
    await quizResult.save();
    await updateUserRecommendations(userId, normalizedTagScores, streamRecommendations, careerCompatibility);

    res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully',
      quizResult: {
        id: quizResult._id,
        tagScores: normalizedTagScores,
        streamRecommendations,
        careerCompatibility,
        insights,
        totalTimeSpent,
        geminiInsights: quizResult.geminiInsights,
      }
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quiz/results/:resultId
// @desc    Get a single quiz result by ID
// @access  Private
router.get('/results/:resultId', auth, async (req, res) => {
  try {
    const { resultId } = req.params;
    const result = await QuizResult.findById(resultId);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Quiz result not found' });
    }

    if (req.user.id !== result.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/quiz/results/history/:userId
// @desc    Get user's quiz history
// @access  Private
router.get('/results/history/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.id !== userId) {
        return res.status(403).json({ message: 'Access denied' });
    }
    const { limit = 10 } = req.query;
    const results = await QuizResult.getUserHistory(userId, parseInt(limit));
    
    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

// --- Helper Functions ---
function calculateStreamRecommendations(tagScores) {
  const streamTagMapping = {
    'Science': ['logical-thinking', 'problem-solving', 'analytical-skills', 'science-interest', 'mathematics-interest', 'technical-skills'],
    'Commerce': ['analytical-skills', 'communication', 'leadership', 'business-interest', 'mathematics-interest'],
    'Arts': ['creativity', 'artistic-ability', 'communication', 'arts-interest', 'design-thinking'],
    'Vocational': ['technical-skills', 'problem-solving', 'hands-on-learning', 'practical-skills']
  };

  const streamScores = {};
  Object.keys(streamTagMapping).forEach(stream => {
    let totalScore = 0;
    let matchedTagCount = 0;

    streamTagMapping[stream].forEach(requiredTag => {
      const userTag = tagScores.find(tag => tag.tag === requiredTag);
      if (userTag) {
        totalScore += userTag.score;
        matchedTagCount += 1;
      }
    });

    console.log(matchedTagCount,totalScore)
    streamScores[stream] = {
      score: matchedTagCount > 0 ? Math.round((matchedTagCount/totalScore) *400*Math.round(Math.random(8,10)*10)) : 0
    };
  });

  return Object.keys(streamScores).map(stream => ({
    stream,
    score: streamScores[stream].score,
    topContributingTags: streamTagMapping[stream]
      .map(tag => {
        const userTag = tagScores.find(t => t.tag === tag);
        return userTag ? { tag, contribution: userTag.score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3),
    recommendedCourses: getCoursesForStream(stream)
  })).sort((a, b) => b.score - a.score);
}

function calculateCareerCompatibility(tagScores) {
  const careerTagMapping = {
    'Engineering': ['logical-thinking', 'problem-solving', 'technical-skills', 'mathematics-interest'],
    'Medicine': ['science-interest', 'helping-others', 'analytical-skills', 'attention-to-detail'],
    'Business': ['leadership', 'communication', 'analytical-skills', 'entrepreneurship'],
    'Design': ['creativity', 'artistic-ability', 'design-thinking', 'visual-skills'],
    'Teaching': ['communication', 'helping-others', 'patience', 'knowledge-sharing'],
    'Research': ['analytical-skills', 'curiosity', 'attention-to-detail', 'logical-thinking']
  };

  return Object.keys(careerTagMapping).map(field => {
    let totalScore = 0;
    let matchedTagCount = 0;

    careerTagMapping[field].forEach(requiredTag => {
      const userTag = tagScores.find(tag => tag.tag === requiredTag);
      if (userTag) {
        totalScore += userTag.score;
        matchedTagCount += 1;
      }
    });

    return {
      field,
      compatibility: matchedTagCount > 0 ? Math.round(totalScore / matchedTagCount) : 0,
      matchingTags: careerTagMapping[field].filter(tag => 
        tagScores.some(userTag => userTag.tag === tag && userTag.score > 60)
      ),
      suggestedRoles: getRolesForField(field)
    };
  }).filter(career => career.compatibility > 0).sort((a, b) => b.compatibility - a.compatibility);
}

function generateInsights(tagScores) {
  const sortedTags = tagScores.sort((a, b) => b.score - a.score);
  
  return {
    topStrengths: sortedTags.slice(0, 5).map(tag => tag.tag),
    areasForExploration: sortedTags.filter(tag => tag.score >= 50 && tag.score < 70).map(tag => tag.tag),
    personalityTraits: sortedTags.filter(tag => ['leadership', 'creativity', 'communication', 'teamwork'].includes(tag.tag)).map(tag => tag.tag),
    learningStyle: determineLearningStyle(tagScores)
  };
}

async function updateUserRecommendations(userId, tagScores, streamRecommendations, careerCompatibility) {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.interestTags = tagScores.map(tag => ({
      tag: tag.tag,
      score: tag.score,
      lastUpdated: new Date()
    }));

    user.recommendations.courses = streamRecommendations.slice(0, 3).map(stream => ({
      course: stream.recommendedCourses[0],
      stream: stream.stream,
      confidence: stream.score,
      reasons: [`Updated based on recent assessment results`],
      geminiSuggestion: false
    }));

    user.recommendations.careerPaths = careerCompatibility.slice(0, 5).map(career => ({
      career: career.field,
      industry: career.field,
      compatibility: career.compatibility,
      educationPath: [`Bachelor's degree in ${career.field}`, 'Relevant internships', 'Professional certification'],
      geminiAnalysis: `Refreshed recommendation based on your latest aptitude assessment.`
    }));

    user.recommendations.lastUpdated = new Date();
    await user.save();
  } catch (error) {
    console.error('Error updating user recommendations:', error);
  }
}

function determineLearningStyle(tagScores) {
  const visualTags = tagScores.filter(tag => ['visual-skills', 'design-thinking', 'creativity'].includes(tag.tag));
  const auditoryTags = tagScores.filter(tag => ['communication', 'verbal-skills'].includes(tag.tag));
  const kinestheticTags = tagScores.filter(tag => ['hands-on-learning', 'practical-skills'].includes(tag.tag));

  const visualScore = visualTags.reduce((sum, tag) => sum + tag.score, 0);
  const auditoryScore = auditoryTags.reduce((sum, tag) => sum + tag.score, 0);
  const kinestheticScore = kinestheticTags.reduce((sum, tag) => sum + tag.score, 0);

  if (visualScore > auditoryScore && visualScore > kinestheticScore) return 'visual';
  if (auditoryScore > kinestheticScore) return 'auditory';
  if (kinestheticScore > 0) return 'kinesthetic';
  return 'mixed';
}

function getCoursesForStream(stream) {
  const courseMappings = {
    'Science': ['B.Tech', 'B.Sc', 'MBBS', 'B.Pharm', 'B.E'],
    'Commerce': ['B.Com', 'BBA', 'B.Com (H)', 'BCA', 'B.A (Economics)'],
    'Arts': ['B.A', 'B.Des', 'B.A (Psychology)', 'B.A (Literature)', 'B.F.A'],
    'Vocational': ['Diploma in Engineering', 'ITI', 'Polytechnic', 'Certificate Courses']
  };
  return courseMappings[stream] || [];
}

function getRolesForField(field) {
  const roleMappings = {
    'Engineering': ['Software Engineer', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer'],
    'Medicine': ['Doctor', 'Surgeon', 'Researcher', 'Healthcare Administrator'],
    'Business': ['Manager', 'Consultant', 'Entrepreneur', 'Business Analyst'],
    'Design': ['Graphic Designer', 'UI/UX Designer', 'Architect', 'Fashion Designer'],
    'Teaching': ['Professor', 'Teacher', 'Trainer', 'Education Administrator'],
    'Research': ['Research Scientist', 'Data Analyst', 'Lab Researcher', 'Academic Researcher']
  };
  return roleMappings[field] || [];
}
