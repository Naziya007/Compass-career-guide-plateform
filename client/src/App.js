import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components (to be created)
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  // This will later be managed by a proper authentication context
  const isAuthenticated = false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/quiz" 
              element={isAuthenticated ? <Quiz /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
