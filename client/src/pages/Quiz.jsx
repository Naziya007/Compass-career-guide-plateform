import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizAPI, apiUtils } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar'; // Make sure this path is correct

const Quiz = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isStarted) {
      const fetchQuizQuestions = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await quizAPI.getQuestions();
          setQuestions(res.data.questions);
          setQuizStartTime(new Date());
        } catch (err) {
          const errorInfo = apiUtils.handleError(err);
          setError(errorInfo.message || 'Failed to load quiz questions. Please try again.');
          setIsStarted(false);
        } finally {
          setLoading(false);
        }
      };
      fetchQuizQuestions();
    }
  }, [isStarted]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const quizEndTime = new Date();
    const quizResponses = questions.map(q => ({
      questionId: q._id,
      selectedOption: answers[q._id] || null,
      wasSkipped: !answers[q._id],
    }));

    try {
      const res = await quizAPI.submitQuiz({
        responses: quizResponses,
        startTime: quizStartTime,
        endTime: quizEndTime,
        quizType: 'comprehensive'
      });
      console.log('Quiz submitted successfully:', res.data);
      navigate(`/dashboard`); // Navigate to dashboard after submission
    } catch (err) {
      const errorInfo = apiUtils.handleError(err);
      setError(errorInfo.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderLoading = () => (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
      Loading quiz questions...
    </div>
  );
  
  const renderError = (errorMessage) => (
     <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="text-center text-red-400">{errorMessage}</div>
      <button 
        onClick={() => setIsStarted(false)} 
        className="mt-6 px-7 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-colors"
      >
        Go Back
      </button>
    </div>
  );

  if (!isStarted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto p-8 rounded-2xl border border-zinc-500 bg-zinc-700/50 backdrop-blur-lg">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-purple-300">
                Career Aptitude
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mt-2">
                  Assessment
                </span>
              </h1>
              <p className="text-xl text-zinc-400">
                Discover your strengths and find your perfect career path.
              </p>
            </div>
            <div className="bg-zinc-900/80 rounded-xl p-8 border border-zinc-800">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">What to Expect</h2>
                  <ul className="space-y-3 text-zinc-300">
                    <li className="flex items-start"><span className="text-green-400 mr-3 text-lg">✓</span>20 questions across multiple categories.</li>
                    <li className="flex items-start"><span className="text-green-400 mr-3 text-lg">✓</span>Assessment of aptitude and interests.</li>
                    <li className="flex items-start"><span className="text-green-400 mr-3 text-lg">✓</span>AI-powered analysis using Google Gemini.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Assessment Details</h3>
                  <div className="space-y-3 text-zinc-400">
                    <div className="flex justify-between"><span>Duration:</span><span className="font-medium text-zinc-200">15-20 minutes</span></div>
                    <div className="flex justify-between"><span>Questions:</span><span className="font-medium text-zinc-200">20 questions</span></div>
                    <div className="flex justify-between"><span>Categories:</span><span className="font-medium text-zinc-200">5+ categories</span></div>
                    <div className="flex justify-between"><span>Results:</span><span className="font-medium text-zinc-200">Instant</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsStarted(true)}
                  className="px-8 py-3 text-lg font-semibold text-zinc-900 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                >
                  Start Assessment 
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loading) return renderLoading();
  if (error && !questions.length) return renderError(error);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 pt-28 pb-12">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Aptitude & Interest Quiz</h1>
          {error && <div className="bg-red-900/50 border border-red-500/30 text-red-300 p-4 mb-6 rounded-lg text-center" role="alert">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-8">
            {questions.map((q, index) => (
              <div key={q._id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <p className="text-lg font-semibold mb-4 text-zinc-200">
                  {index + 1}. {q.questionText}
                </p>
                {q.options?.length > 0 && (
                  <div className="space-y-3">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="block cursor-pointer">
                        <input
                          type="radio"
                          name={q._id}
                          value={option.text}
                          onChange={() => handleAnswerChange(q._id, option.text)}
                          checked={answers[q._id] === option.text}
                          className="peer sr-only" // Hide the default radio button
                        />
                        <div className="p-4 rounded-lg text-zinc-300 border border-zinc-700 bg-zinc-800/50 transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-green-900/30 peer-checked:text-white hover:border-zinc-500">
                          {option.text}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="submit"
              className="w-full p-4 text-base font-semibold text-zinc-900 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Quiz;