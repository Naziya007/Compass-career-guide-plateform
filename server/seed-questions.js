const mongoose = require('mongoose');
const Question = require('./models/Question'); // Import your Question model
require('dotenv').config();

// Sample questions that match your Mongoose schema
const questions = [
  {
    questionText: 'When faced with a complex problem, I am most likely to:',
    questionType: 'multiple-choice',
    options: [
      { text: 'Break it down into smaller parts and solve each step-by-step.', value: 10, tags: ['logical-thinking', 'problem-solving'] },
      { text: 'Brainstorm creative, unconventional solutions.', value: 8, tags: ['creativity', 'innovative-thinking'] },
      { text: 'Look for existing examples and modify them to fit the situation.', value: 6, tags: ['technical-skills', 'practical-skills'] },
      { text: 'Discuss the problem with a team to get different perspectives.', value: 7, tags: ['communication', 'teamwork', 'leadership'] },
    ],
    primaryTags: ['logical-thinking', 'problem-solving', 'creativity'],
    category: 'aptitude',
    difficulty: 'medium',
  },
  {
    questionText: 'Which of the following activities do you enjoy the most?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Analyzing data and finding patterns.', value: 10, tags: ['analytical-skills', 'mathematics-interest'] },
      { text: 'Writing stories, poems, or articles.', value: 9, tags: ['creativity', 'arts-interest'] },
      { text: 'Organizing events or leading a group project.', value: 8, tags: ['leadership', 'communication'] },
      { text: 'Working with hands-on projects like building or repairing things.', value: 7, tags: ['technical-skills', 'practical-skills'] },
    ],
    primaryTags: ['analytical-skills', 'creativity', 'leadership'],
    category: 'interest',
    difficulty: 'easy',
  },
  {
    questionText: 'How would your friends describe you?',
    questionType: 'multiple-choice',
    options: [
      { text: 'A good listener who provides sound advice.', value: 9, tags: ['communication', 'empathy'] },
      { text: 'The one who always comes up with new ideas.', value: 10, tags: ['creativity', 'innovative-thinking'] },
      { text: 'Someone who is organized and keeps things on track.', value: 8, tags: ['leadership', 'management'] },
      { text: 'A detail-oriented person who notices small things others miss.', value: 7, tags: ['attention-to-detail', 'analytical-skills'] },
    ],
    primaryTags: ['communication', 'creativity', 'attention-to-detail'],
    category: 'personality',
    difficulty: 'medium',
  },
  {
    questionText: 'How do you prefer to learn a new skill?',
    questionType: 'multiple-choice',
    options: [
      { text: 'By reading books and articles.', value: 7, tags: ['analytical-skills', 'research-interest'] },
      { text: 'By watching videos or listening to podcasts.', value: 8, tags: ['visual-skills', 'auditory-skills'] },
      { text: 'By doing and practicing myself.', value: 10, tags: ['technical-skills', 'hands-on-learning', 'practical-skills'] },
      { text: 'By collaborating with others in a group setting.', value: 9, tags: ['teamwork', 'communication'] },
    ],
    primaryTags: ['learning-style', 'practical-skills', 'communication'],
    category: 'skills',
    difficulty: 'easy',
  },
  {
    questionText: 'What matters most to you in a career?',
    questionType: 'multiple-choice',
    options: [
      { text: 'High salary and financial stability.', value: 6, tags: ['business-interest', 'management'] },
      { text: 'Making a positive impact on society.', value: 10, tags: ['empathy', 'helping-others'] },
      { text: 'Creative freedom and self-expression.', value: 9, tags: ['creativity', 'arts-interest'] },
      { text: 'The opportunity to constantly learn and solve new challenges.', value: 8, tags: ['problem-solving', 'analytical-skills'] },
    ],
    primaryTags: ['values', 'creativity', 'problem-solving'],
    category: 'values',
    difficulty: 'medium',
  },
  {
    questionText: 'Which of these subjects are you most passionate about?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Mathematics and Physics.', value: 10, tags: ['science-interest', 'mathematics-interest'] },
      { text: 'Literature and History.', value: 9, tags: ['arts-interest', 'research-interest'] },
      { text: 'Economics and Commerce.', value: 8, tags: ['business-interest'] },
      { text: 'Computer Science and Technology.', value: 10, tags: ['technical-skills', 'logical-thinking'] },
    ],
    primaryTags: ['science-interest', 'arts-interest', 'business-interest', 'technical-skills'],
    category: 'interest',
    difficulty: 'easy',
  },
  {
    questionText: 'You are planning a project. What role do you naturally take?',
    questionType: 'multiple-choice',
    options: [
      { text: 'The visionary, coming up with the big idea.', value: 9, tags: ['creativity', 'leadership'] },
      { text: 'The organizer, creating a detailed plan and schedule.', value: 8, tags: ['management', 'attention-to-detail'] },
      { text: 'The executor, focusing on the technical tasks.', value: 10, tags: ['technical-skills', 'hands-on-learning'] },
      { text: 'The communicator, keeping everyone on the same page.', value: 7, tags: ['communication', 'teamwork'] },
    ],
    primaryTags: ['leadership', 'technical-skills', 'management'],
    category: 'personality',
    difficulty: 'medium',
  },
  {
    questionText: 'How do you react to criticism?',
    questionType: 'multiple-choice',
    options: [
      { text: 'I take it constructively and use it to improve.', value: 9, tags: ['adaptability', 'self-awareness'] },
      { text: 'I tend to get defensive and take it personally.', value: 4, tags: ['emotional-intelligence'] },
      { text: 'I ignore it if I don’t agree with it.', value: 5, tags: ['confidence'] },
      { text: 'I ask for more details to understand the perspective.', value: 10, tags: ['analytical-skills', 'problem-solving'] },
    ],
    primaryTags: ['adaptability', 'analytical-skills', 'emotional-intelligence'],
    category: 'personality',
    difficulty: 'hard',
  },
  {
    questionText: 'What is your preferred method for solving puzzles?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Trying every possible combination until I find the solution.', value: 6, tags: ['patience', 'endurance'] },
      { text: 'Methodically using logic to eliminate incorrect options.', value: 10, tags: ['logical-thinking', 'analytical-skills'] },
      { text: 'Visualizing the solution in my head.', value: 9, tags: ['spatial-reasoning', 'creativity'] },
      { text: 'Asking a friend for help or a hint.', value: 5, tags: ['teamwork'] },
    ],
    primaryTags: ['logical-thinking', 'analytical-skills', 'creativity'],
    category: 'aptitude',
    difficulty: 'medium',
  },
  {
    questionText: 'What kind of TV shows do you prefer?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Documentaries and science shows.', value: 10, tags: ['science-interest', 'analytical-skills'] },
      { text: 'Dramas and historical series.', value: 9, tags: ['arts-interest', 'communication'] },
      { text: 'Business and entrepreneurial reality shows.', value: 8, tags: ['business-interest', 'leadership'] },
      { text: 'DIY and home renovation shows.', value: 7, tags: ['practical-skills', 'hands-on-learning'] },
    ],
    primaryTags: ['science-interest', 'arts-interest', 'business-interest'],
    category: 'interest',
    difficulty: 'easy',
  },
  {
    questionText: 'You are working on a group project. Which of these scenarios would you find most frustrating?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Unclear goals and a lack of direction.', value: 9, tags: ['management', 'leadership'] },
      { text: 'Personality conflicts and poor communication.', value: 8, tags: ['communication', 'teamwork'] },
      { text: 'Having to do repetitive, mundane tasks.', value: 7, tags: ['creativity'] },
      { text: 'A lack of proper resources to complete the work.', value: 6, tags: ['problem-solving', 'technical-skills'] },
    ],
    primaryTags: ['management', 'communication', 'problem-solving'],
    category: 'values',
    difficulty: 'medium',
  },
  {
    questionText: 'How do you handle deadlines?',
    questionType: 'multiple-choice',
    options: [
      { text: 'I start early and finish well ahead of time.', value: 10, tags: ['organization', 'discipline'] },
      { text: 'I work best under pressure and get it done at the last minute.', value: 6, tags: ['stress-management'] },
      { text: 'I prioritize and focus on the most important tasks first.', value: 9, tags: ['management', 'problem-solving'] },
      { text: 'I often miss them, or have to ask for extensions.', value: 4, tags: ['time-management'] },
    ],
    primaryTags: ['time-management', 'management', 'organization'],
    category: 'skills',
    difficulty: 'hard',
  },
  {
    questionText: 'Which tool or skill would you be most interested in learning?',
    questionType: 'multiple-choice',
    options: [
      { text: 'A programming language like Python or Java.', value: 10, tags: ['technical-skills', 'logical-thinking'] },
      { text: 'A graphic design software like Adobe Photoshop.', value: 9, tags: ['creativity', 'visual-skills'] },
      { text: 'Public speaking and presentation skills.', value: 8, tags: ['communication', 'leadership'] },
      { text: 'Financial modeling and analysis.', value: 7, tags: ['analytical-skills', 'business-interest'] },
    ],
    primaryTags: ['technical-skills', 'creativity', 'communication', 'analytical-skills'],
    category: 'interest',
    difficulty: 'medium',
  },
  {
    questionText: 'What kind of problems excite you the most?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Abstract puzzles with no clear answer.', value: 9, tags: ['logical-thinking', 'problem-solving'] },
      { text: 'Improving an existing system or process.', value: 8, tags: ['analytical-skills', 'efficiency'] },
      { text: 'Building something entirely new from scratch.', value: 10, tags: ['technical-skills', 'innovative-thinking'] },
      { text: 'Helping a person or community in need.', value: 7, tags: ['empathy', 'helping-others'] },
    ],
    primaryTags: ['problem-solving', 'innovative-thinking', 'helping-others'],
    category: 'aptitude',
    difficulty: 'hard',
  },
  {
    questionText: 'How do you typically spend your free time?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Reading about new technologies or scientific discoveries.', value: 10, tags: ['science-interest', 'technical-skills'] },
      { text: 'Visiting museums, galleries, or attending cultural events.', value: 9, tags: ['arts-interest', 'creativity'] },
      { text: 'Following financial markets or business news.', value: 8, tags: ['business-interest', 'analytical-skills'] },
      { text: 'Volunteering or participating in community service.', value: 7, tags: ['empathy', 'helping-others'] },
    ],
    primaryTags: ['science-interest', 'arts-interest', 'business-interest', 'helping-others'],
    category: 'interest',
    difficulty: 'medium',
  },
  {
    questionText: 'What do you consider your biggest strength?',
    questionType: 'multiple-choice',
    options: [
      { text: 'I am a natural leader and motivate others.', value: 10, tags: ['leadership', 'communication'] },
      { text: 'I have a keen eye for detail and notice things others miss.', value: 9, tags: ['attention-to-detail', 'analytical-skills'] },
      { text: 'I am an excellent communicator and presenter.', value: 8, tags: ['communication', 'public-speaking'] },
      { text: 'I am highly creative and think outside the box.', value: 7, tags: ['creativity', 'innovative-thinking'] },
    ],
    primaryTags: ['leadership', 'attention-to-detail', 'communication', 'creativity'],
    category: 'personality',
    difficulty: 'hard',
  },
  {
    questionText: 'Which of these would you prefer to do in a typical workday?',
    questionType: 'multiple-choice',
    options: [
      { text: 'Working on a single, long-term project with a clear goal.', value: 9, tags: ['focus', 'discipline'] },
      { text: 'Juggling multiple small projects with tight deadlines.', value: 7, tags: ['time-management', 'adaptability'] },
      { text: 'Collaborating closely with a team to achieve a shared vision.', value: 8, tags: ['teamwork', 'communication'] },
      { text: 'Working independently with minimal supervision.', value: 10, tags: ['autonomy', 'self-discipline'] },
    ],
    primaryTags: ['management', 'teamwork', 'autonomy'],
    category: 'values',
    difficulty: 'medium',
  },
  {
    questionText: 'What is your reaction when a project fails?',
    questionType: 'multiple-choice',
    options: [
      { text: 'I analyze what went wrong to prevent it from happening again.', value: 10, tags: ['problem-solving', 'analytical-skills'] },
      { text: 'I am disappointed, but I move on to the next task quickly.', value: 7, tags: ['resilience', 'adaptability'] },
      { text: 'I blame others or external factors for the failure.', value: 4, tags: ['accountability'] },
      { text: 'I try to find a creative way to salvage the project.', value: 9, tags: ['creativity', 'innovative-thinking'] },
    ],
    primaryTags: ['problem-solving', 'analytical-skills', 'creativity'],
    category: 'personality',
    difficulty: 'medium',
  },
  {
    questionText: 'Which of these best describes your approach to a new technology?',
    questionType: 'multiple-choice',
    options: [
      { text: 'I read the documentation and understand its principles before using it.', value: 10, tags: ['technical-skills', 'research-interest'] },
      { text: 'I jump right in and learn by trial and error.', value: 8, tags: ['hands-on-learning', 'practical-skills'] },
      { text: 'I wait for others to figure it out before I try it myself.', value: 5, tags: ['risk-aversion'] },
      { text: 'I find a course or tutorial to guide me through it.', value: 7, tags: ['learning-style', 'discipline'] },
    ],
    primaryTags: ['technical-skills', 'learning-style', 'hands-on-learning'],
    category: 'skills',
    difficulty: 'medium',
  },
  {
    questionText: 'Which type of task do you find most rewarding?',
    questionType: 'multiple-choice',
    options: [
      { text: 'A task that has a measurable, quantitative result.', value: 10, tags: ['analytical-skills', 'efficiency'] },
      { text: 'A task that allows for a lot of personal expression.', value: 9, tags: ['creativity', 'arts-interest'] },
      { text: 'A task that involves working with and helping people.', value: 8, tags: ['empathy', 'helping-others'] },
      { text: 'A task that is part of a larger, well-defined plan.', value: 7, tags: ['organization', 'management'] },
    ],
    primaryTags: ['analytical-skills', 'creativity', 'helping-others', 'management'],
    category: 'values',
    difficulty: 'easy',
  },
];

// Connect to MongoDB and insert data
const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-guidance-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding.');

    // Clear existing questions before adding new ones (optional)
    await Question.deleteMany({});
    console.log('Existing questions deleted.');

    // Insert new questions
    await Question.insertMany(questions);
    console.log('Database successfully seeded with new questions!');

  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
