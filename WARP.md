# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Full Development Environment
```bash
# Install all dependencies (server + client)
npm run install:all

# Start both server and client concurrently for development
npm run dev

# Build the client application for production
npm run build

# Start production server (requires client to be built)
npm start
```

### Server Commands
```bash
# Development server with hot reload
npm run server:dev

# Production server
npm run server:start

# Run from server directory
cd server && npm run dev
cd server && npm start
```

### Client Commands
```bash
# Development server (React)
npm run client:dev

# Production build
npm run client:build

# Run from client directory
cd client && npm start
cd client && npm run build
```

### Testing
```bash
# Run all tests (both server and client)
npm test

# Run server tests only
cd server && npm test

# Run client tests only
cd client && npm test
```

## Architecture Overview

### Core Technology Stack
- **Backend**: Node.js + Express.js with MongoDB (Mongoose ODM)
- **Frontend**: React.js with Tailwind CSS for styling
- **AI Integration**: Google Gemini API for career analysis and recommendations
- **Authentication**: JWT-based authentication
- **Development Tools**: Concurrently for running multiple services, Nodemon for development

### Data Models & Core Concepts

#### Tag-Based Assessment System
The platform uses a sophisticated tag-based system for career guidance:
- **Questions** have `primaryTags` (e.g., 'logical-thinking', 'creativity', 'technical-skills')
- **User responses** generate scores for each tag (0-100 scale)
- **Stream recommendations** (Science/Commerce/Arts/Vocational) are calculated based on tag mappings
- **Career compatibility** is determined by matching user tag scores to career field requirements

#### Key Data Models
1. **User Model**: Stores profile data, quiz history, interest tags, and AI-generated recommendations
2. **Question Model**: Contains quiz questions with tag mappings, stream relevance, and career field associations
3. **QuizResult Model**: Stores quiz responses, calculated tag scores, stream recommendations, and career compatibility

### API Structure

#### Core Endpoints
- `/api/auth/*` - Authentication (login, register, profile management)
- `/api/quiz/*` - Quiz questions, submission, and results
- `/api/gemini/*` - AI-powered career analysis and recommendations
- `/api/users/*` - User profile management
- `/api/recommendations/*` - Personalized course and career recommendations

#### Key Gemini AI Features
- **Career Analysis**: Personalized advice based on quiz results and user profile
- **Course Mapping**: Detailed career pathways for specific courses/streams
- **Skill Recommendations**: Time-bound skill development roadmaps

### Environment Configuration

Required environment variables (see `server/.env.example`):
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key (essential for AI features)
- `PORT` - Server port (default: 5000)
- `CLIENT_URL` - Frontend URL for CORS (default: http://localhost:3000)

### Development Patterns

#### Quiz System Architecture
- Questions are categorized by type: 'aptitude', 'interest', 'personality', 'values', 'skills'
- Balanced quiz generation ensures representation across all categories
- Tag scoring system automatically calculates user strengths and interests
- Stream and career recommendations are generated algorithmically, then enhanced by Gemini AI

#### AI Integration Pattern
- All Gemini API calls include user context (profile + quiz results) for personalization
- API responses are stored in the database for future reference
- Fallback mechanisms handle API unavailability gracefully
- Status endpoint (`/api/gemini/status`) checks API configuration

#### Frontend Structure
- React Router handles authentication-protected routes
- Tailwind CSS with custom color scheme (primary blue, secondary green)
- Component structure follows typical React patterns (pages, components, services)

### Database Indexes & Performance
Key indexes are configured for:
- User email lookups
- Tag-based queries for questions and results
- Quiz result filtering by user and completion status
- Stream and career field associations

### Common Development Tasks

#### Adding New Question Tags
1. Update tag mappings in `server/routes/quiz.js` functions:
   - `calculateStreamRecommendations()` 
   - `calculateCareerCompatibility()`
2. Ensure question documents include the new tags in `primaryTags` array

#### Extending AI Functionality
- Add new routes in `server/routes/gemini.js`
- Include user context data for personalization
- Update quiz result model to store new AI insights

#### Modifying User Profile Structure
- Update `server/models/User.js` schema
- Add database migrations if needed
- Update frontend forms and validation

### Testing the AI Integration
```bash
# Check if Gemini API is configured
curl http://localhost:5000/api/gemini/status

# Test career analysis (requires user ID and quiz data)
curl -X POST http://localhost:5000/api/gemini/analyze-career \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "prompt": "What career paths suit me?"}'
```

### Security Considerations
- JWT tokens for API authentication
- Helmet.js for security headers
- Input validation for all API endpoints
- Environment variables for sensitive data (never commit .env files)

### Development Notes
- Server runs on port 5000, client on port 3000
- CORS is configured to allow client-server communication
- Morgan logging is enabled for request monitoring
- Comprehensive error handling middleware in place
