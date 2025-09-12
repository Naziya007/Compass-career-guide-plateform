import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { quizAPI, apiUtils } from '../services/api';

const QuizResults = () => {
  const { quizId } = useParams();
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await quizAPI.getResults(quizId);
        setQuizResult(res.data.result);
      } catch (err) {
        console.error("Failed to fetch quiz results:", err);
        const errorInfo = apiUtils.handleError(err);
        setError(errorInfo.message || "Failed to load quiz results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizResult();
  }, [quizId]);

  if (loading) {
    return <div className="text-center mt-20 text-gray-500">Loading your quiz results...</div>;
  }
  
  if (error || !quizResult) {
    return (
      <div className="text-center mt-20 text-red-500">
        {error || "Quiz result not found."}
        <Link to="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-md">
          Go to Dashboard
        </Link>
      </div>
    );
  }



  const topTagScores = [...quizResult.tagScores].sort((a, b) => b.score - a.score).slice(0, 5);
  
  const radarChartData = topTagScores.map(tag => ({
    tag: tag.tag.replace('-', ' '),
    score: tag.score,
    fullMark: 100
  }));

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-800';
    if (score >= 60) return 'text-green-600';
    return 'text-yellow-600';
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md mt-10">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Results</h1>
        <p className="text-xl text-gray-600">Here's a breakdown of your strengths and recommendations.</p>
        <p className="text-sm text-gray-500 mt-2">Completed on: {new Date(quizResult.createdAt).toLocaleDateString()}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Radar Chart Section */}
        <div className="p-6 bg-gray-50 rounded-lg border flex flex-col items-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Your Aptitude Profile</h2>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart outerRadius={150} width={500} height={400} data={radarChartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="tag" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recommendations Section */}
        <div className="p-6 bg-gray-50 rounded-lg border">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">Recommendations</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Recommended Streams</h3>
              <ul className="space-y-2">
                {quizResult.streamRecommendations.map((stream, index) => (
                  <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                    <span className="font-medium text-gray-700">{stream.stream}</span>
                    <span className={`text-sm font-medium ${getScoreColor(stream.score)}`}>
                      {stream.score}% match
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Career Compatibility</h3>
              <ul className="space-y-2">
                {quizResult.careerCompatibility.map((career, index) => (
                  <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                    <span className="font-medium text-gray-700">{career.field}</span>
                    <span className={`text-sm font-medium ${getScoreColor(career.compatibility)}`}>
                      {career.compatibility}% compatibility
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <Link to="/dashboard" className="inline-block px-8 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;
