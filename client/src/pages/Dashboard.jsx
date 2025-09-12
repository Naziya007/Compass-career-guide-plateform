import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { recommendationsAPI, apiUtils } from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Make sure this path is correct

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Updated color functions to match the new green/purple theme
  const getScoreColor = (score) => {
    return 'bg-green-500';
  };

  const getScoreTextColor = (score) => {
     return 'text-green-400';
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (user) {
        try {
          // Mocking the API response for demonstration purposes
          // In a real app, you would use your actual API call:
          const res = await recommendationsAPI.getUserRecommendations(user._id);
          setRecommendations(res.data);
          
          // MOCK DATA START
          // const mockData = {
          //   geminiInsights: {
          //     careerSuggestions: "Based on your strong analytical and creative skills, you are well-suited for roles in Data Science or UX/UI Design. These fields will leverage your problem-solving abilities while allowing you to innovate."
          //   },
          //   interestTags: [
          //     { tag: 'analytical-thinking', score: 85 },
          //     { tag: 'creative-problem-solving', score: 92 },
          //     { tag: 'technical-aptitude', score: 78 },
          //     { tag: 'collaboration', score: 65 },
          //     { tag: 'leadership', score: 55 },
          //   ],
          //   recommendations: {
          //     courses: [
          //       { stream: "Science Stream", course: "Computer Science", confidence: 90 },
          //       { stream: "Design Stream", course: "Human-Computer Interaction", confidence: 85 },
          //     ],
          //     careerPaths: [
          //       { career: "Data Scientist", compatibility: 92 },
          //       { career: "UX/UI Designer", compatibility: 88 },
          //       { career: "Software Engineer", compatibility: 80 },
          //     ]
          //   }
          // };
          // setRecommendations(mockData);
          // MOCK DATA END

        } catch (err) {
          console.error('Failed to fetch recommendations:', err);
          const errorInfo = apiUtils.handleError(err);
          setFetchError(errorInfo.message || 'Failed to load recommendations. Please try again.');
        } finally {
          setFetchLoading(false);
        }
      }
    };

    if (!authLoading) {
      fetchRecommendations();
    }
  }, [user, authLoading]);

  if (authLoading || fetchLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Loading your dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500 text-center p-4">
          You must be logged in to view this page.
        </div>
      </>
    );
  }

  const topCareersData = recommendations?.recommendations?.careerPaths
    .sort((a, b) => b.compatibility - a.compatibility) // Sort by compatibility score
    .slice(0, 5); 
  const geminiSummary = recommendations?.geminiInsights?.careerSuggestions;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 text-white font-sans pt-28">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Welcome back, {user.profile?.firstName || 'User'}!
            </h1>
            <p className="text-zinc-400">
              Here is your personalized career guidance dashboard.
            </p>
          </div>

          {fetchError && (
            <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-4 mb-8 rounded-lg" role="alert">
              <p>{fetchError}</p>
            </div>
          )}

          {/* Gemini AI Summary Section */}
          {geminiSummary && (
             <div className="relative p-6 mb-10 bg-zinc-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-lg">
                <div className="absolute -top-3 -left-3 w-16 h-16 bg-purple-500/20 rounded-full filter blur-2xl"></div>
                <div className="font-semibold text-lg flex items-center mb-2 text-purple-300">
                  <span className="mr-3 text-xl">✨</span>
                  AI-Powered Career Insight
                </div>
                <p className="text-zinc-300">{geminiSummary}</p>
            </div>
          )}

          {recommendations?.interestTags?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Skills Analysis */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-green-400/50 transition-colors duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Your Skills Analysis</h2>
                <div className="space-y-4">
                  {recommendations.interestTags.map((tag, index) => (
                    (index<6?
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-300 capitalize">
                          {tag.tag.replace('-', ' ')}
                        </span>
                        <span className={`text-sm font-medium ${getScoreTextColor(tag.score)}`}>
                          {tag.score}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreColor(tag.score)}`}
                          style={{ width: `${tag.score}%` }}
                        ></div>
                      </div>
                    </div>:<></>)
                  ))}
                </div>
              </div>

              {/* Recommended Streams */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-purple-400/50 transition-colors duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Recommended Streams</h2>
                <div className="space-y-4">
                  {recommendations.recommendations.courses.map((stream, index) => (
                    <div key={index} className="border border-zinc-800 rounded-lg p-4 bg-zinc-900">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-zinc-200">{stream.stream}</h3>
                        <span className={`text-sm font-semibold ${getScoreTextColor(stream.confidence)}`}>
                          {stream.confidence}% Match
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-md">
                          {stream.course}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Compatibility */}
               <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-purple-400/50 transition-colors duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Top 5 Career Compatibility</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={topCareersData}>
                    <PolarGrid stroke="#404040" /> 
                    <PolarAngleAxis dataKey="career" tick={{ fill: '#a1a1aa', fontSize: 13 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="Compatibility" 
                      dataKey="compatibility" 
                      stroke="green" // Purple line
                      fill="green"   // Purple fill
                      fillOpacity={0.6} 
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #404040', borderRadius: '0.5rem' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Next Steps */}
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-purple-400/50 transition-colors duration-300">
                <h2 className="text-xl font-bold text-white mb-6">Next Steps</h2>
                <div className="space-y-3">
                  <Link to="/quiz" className="block group">
                    <div className="flex items-start p-4 bg-zinc-900 rounded-lg transition-colors group-hover:bg-zinc-800">
                      <span className="text-green-400 mr-4 text-xl">📝</span>
                      <div>
                        <h3 className="font-semibold text-zinc-200">Retake Assessment</h3>
                        <p className="text-sm text-zinc-400">Update your results with recent changes</p>
                      </div>
                    </div>
                  </Link>
                  <Link to="/ai-analysis" className="block group">
                     <div className="flex items-start p-4 bg-zinc-900 rounded-lg transition-colors group-hover:bg-zinc-800">
                      <span className="text-purple-400 mr-4 text-xl">🤖</span>
                      <div>
                        <h3 className="font-semibold text-zinc-200">Explore AI Analysis</h3>
                        <p className="text-sm text-zinc-400">Get detailed career guidance from Gemini AI</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center bg-zinc-900/50 p-10 rounded-2xl border border-zinc-800">
              <p className="text-xl text-zinc-400 mb-6">
                It looks like you haven't completed a quiz yet.
              </p>
              <Link
                to="/quiz"
                className="inline-block px-8 py-3 text-base font-semibold text-zinc-900 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
              >
                Take the Quiz Now!
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;