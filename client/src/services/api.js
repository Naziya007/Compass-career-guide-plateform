import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  // Use import.meta.env to access environment variables in Vite
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Quiz API calls
export const  quizAPI = {
  getQuestions: (params = {}) => api.get('/quiz/questions', { params }),
  submitQuiz: (quizData) => api.post('/quiz/submit', quizData),
  getResults: (userId, limit = 10) => api.get(`/quiz/results/${userId}`, { params: { limit } }),
  getQuestionsByCategory: (category, limit = 20) =>
    api.get('/quiz/questions', { params: { category, limit } }),
};

// User API calls
export const userAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  getUserRecommendations: (userId) => api.get(`/users/${userId}/recommendations`),
  updatePreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences),
};

// Gemini AI API calls
export const geminiAPI = {
  analyzeCareer: (analysisData) => api.post('/gemini/analyze-career', analysisData),
  getCourseMapping: (courseData) => api.post('/gemini/course-mapping', courseData),
  getSkillRecommendations: (skillData) => api.post('/gemini/skill-recommendations', skillData),
  checkStatus: () => api.get('/gemini/status'),
};

// Recommendations API calls
export const recommendationsAPI = {
  getUserRecommendations: (userId) => api.get(`/recommendations/${userId}`),
  updateRecommendations: (userId, recommendations) =>
    api.put(`/recommendations/${userId}`, recommendations),
  getStreamRecommendations: (userId) => api.get(`/recommendations/${userId}/streams`),
  getCareerRecommendations: (userId) => api.get(`/recommendations/${userId}/careers`),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response received
      return {
        message: 'Network error - please check your connection',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
        data: null,
      };
    }
  },

  // Format API responses consistently
  formatResponse: (response) => ({
    success: true,
    data: response.data,
    message: response.data?.message || 'Success',
    status: response.status,
  }),

  // Create form data for file uploads
  createFormData: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  },

  // Validate response data
  validateResponse: (response, expectedFields = []) => {
    if (!response.data) {
      throw new Error('Invalid response format');
    }

    const missingFields = expectedFields.filter(field => !(field in response.data));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    return true;
  },
};

