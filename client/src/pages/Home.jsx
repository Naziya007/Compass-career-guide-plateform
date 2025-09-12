import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Adjust the import path if needed

const Home = () => {

  const features = [
    {
      icon: '🎯',
      title: 'Tag-Based Assessment',
      description: 'Sophisticated tag-based analysis to understand your unique strengths and interests.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Guidance',
      description: 'Personalized career recommendations powered by Google Gemini AI, tailored specifically to your results.',
    },
    {
      icon: '📚',
      title: 'Course Mapping',
      description: 'Detailed mapping of courses to career paths, helping you choose the right educational journey.',
    },
    {
      icon: '🎓',
      title: 'Stream Guidance',
      description: 'Expert recommendations for Science, Commerce, Arts, or Vocational streams based on your aptitude.',
    },
    {
      icon: '💡',
      title: 'Skill Development',
      description: 'Personalized skill development roadmaps with timelines and resource recommendations.',
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Track your skill development and career preparation journey with comprehensive analytics.',
    }
  ];

  const stats = [
    { label: 'Assessment Categories', value: '5+' },
    { label: 'Career Fields', value: '50+' },
    { label: 'Success Rate', value: '95%' },
    { label: 'Personalized Results', value: '100%' }
  ];

  const howItWorksSteps = [
    {
      number: '1',
      title: 'Take the Assessment',
      description: 'Complete our comprehensive aptitude and interest assessment questionnaire to discover your unique profile.',
    },
    {
      number: '2',
      title: 'Get AI Analysis',
      description: 'Our AI analyzes your responses and generates personalized career recommendations.',
    },
    {
      number: '3',
      title: 'Follow Your Path',
      description: 'Access detailed course recommendations, skill roadmaps, and career guidance tailored for you.',
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950">
        
        <Navbar />

        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: 'url("https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDI0LTAzL3Jhd3BpeGVsX29mZmljZV80NV9hYnN0cmFjdF9wYXJ0aWNsZV90ZWNobm9sb2d5X2JhY2tncm91bmRfY3liZV82ODllMjlmZS03Mzg3LTQ4ZGQtYTMxOC04YjMxOTIwYWJhOTJfMS5qcGc.jpg")' }}
        ></div>
    
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-screen">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/20 text-zinc-300 text-sm font-medium">
            <span>Powered by Google Gemini AI</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-purple-300">
            The Comprehensive Tool for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mt-2">
              Career Excellence
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
            Compass is your key to unlocking career potential. With real-time insights and intuitive analytics, drive your future forward.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              // MODIFIED: Smaller padding, smaller text, and less circular border
              className="px-7 py-2.5 text-base font-semibold text-zinc-900 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            >
              Start for free
            </Link>
            <Link
              to="/quiz"
              // MODIFIED: Smaller padding, smaller text, and less circular border
              className="px-7 py-2.5 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-colors duration-300 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Take a Quick Quiz
            </Link>
          </div>
        </div>
      </section>

       {/* How It Works Section */}
      <section className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Your Journey in Three Simple Steps
            </h2>
            <p className="text-lg text-zinc-400">
              Simple steps to discover your perfect career path.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
             <div className="hidden md:block absolute top-[60px] left-0 w-full h-px bg-zinc-800 -translate-y-1/2"></div>
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center relative bg-zinc-900/50 backdrop-blur-sm p-8 rounded-2xl border border-zinc-800 shadow-xl hover:border-purple-400/50 transition-colors duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-purple-400/30 text-purple-300 font-bold text-3xl shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-zinc-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-zinc-950 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
              Why Choose Compass?
            </h2>
            <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with proven assessment methods to guide you toward your ideal career path.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-green-400/50 transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-5">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-br from-zinc-950 to-purple-950">
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob opacity-50 z-0"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000 opacity-50 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-zinc-300 mb-8">
            Begin your journey with Compass and unlock your full potential.
          </p>
          <Link
            to="/register"
            className="px-10 py-4 text-lg font-bold text-zinc-900 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full hover:from-green-500 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(52,211,153,0.6)]"
          >
            Get Started Today - It's Free!
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <div className="text-2xl font-bold text-white mb-2">🎯 Compass</div>
              <p className="text-zinc-500">AI-powered career guidance for the next generation.</p>
            </div>
            <div className="text-sm text-zinc-500 mt-6 md:mt-0">
              Made with ❤️ by Team Below Average
            </div>
          </div>
          <div className="mt-8 pt-6 text-center text-zinc-600 text-sm">
            &copy; {new Date().getFullYear()} Compass. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;