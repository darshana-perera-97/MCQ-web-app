// Mock data for the LMS Platform

// Current logged-in student
export let currentStudent = {
  id: 'student-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  role: 'student',
  score: 450,
  dailyLimit: 10,
  dailyCompleted: 5,
  lastResetDate: '2026-03-01',
};

// Mock users for admin management
export let mockUsers = [
  currentStudent,
  {
    id: 'student-2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    role: 'student',
    score: 520,
    dailyLimit: 10,
    dailyCompleted: 7,
    lastResetDate: '2026-03-01',
  },
  {
    id: 'student-3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'student',
    score: 380,
    dailyLimit: 10,
    dailyCompleted: 3,
    lastResetDate: '2026-03-01',
  },
  {
    id: 'student-4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    role: 'student',
    score: 610,
    dailyLimit: 10,
    dailyCompleted: 10,
    lastResetDate: '2026-03-01',
  },
  {
    id: 'student-5',
    name: 'David Park',
    email: 'david.park@example.com',
    role: 'student',
    score: 295,
    dailyLimit: 10,
    dailyCompleted: 2,
    lastResetDate: '2026-03-01',
  },
];

// Mock MCQ questions
export let mockMCQs = [
  {
    id: 'MCQ-001',
    questionText: 'What is the time complexity of binary search in a sorted array?',
    optionA: 'O(n)',
    optionB: 'O(log n)',
    optionC: 'O(n²)',
    optionD: 'O(1)',
    correctAnswer: 'B',
    category: 'Data Structures',
  },
  {
    id: 'MCQ-002',
    questionText: 'Which of the following is NOT a JavaScript data type?',
    optionA: 'String',
    optionB: 'Boolean',
    optionC: 'Float',
    optionD: 'Undefined',
    correctAnswer: 'C',
    category: 'JavaScript',
  },
  {
    id: 'MCQ-003',
    questionText: 'In React, what hook is used for side effects?',
    optionA: 'useState',
    optionB: 'useEffect',
    optionC: 'useContext',
    optionD: 'useReducer',
    correctAnswer: 'B',
    category: 'React',
  },
  {
    id: 'MCQ-004',
    questionText: 'What does HTTP stand for?',
    optionA: 'HyperText Transfer Protocol',
    optionB: 'High Transfer Text Protocol',
    optionC: 'HyperText Transmission Process',
    optionD: 'Home Tool Transfer Protocol',
    correctAnswer: 'A',
    category: 'Networking',
  },
  {
    id: 'MCQ-005',
    questionText: 'Which SQL clause is used to filter records?',
    optionA: 'SELECT',
    optionB: 'FROM',
    optionC: 'WHERE',
    optionD: 'ORDER BY',
    correctAnswer: 'C',
    category: 'Database',
  },
  {
    id: 'MCQ-006',
    questionText: 'What is the primary purpose of CSS Grid?',
    optionA: 'Style text elements',
    optionB: 'Create two-dimensional layouts',
    optionC: 'Add animations',
    optionD: 'Handle responsive images',
    correctAnswer: 'B',
    category: 'CSS',
  },
  {
    id: 'MCQ-007',
    questionText: 'Which design pattern ensures a class has only one instance?',
    optionA: 'Factory',
    optionB: 'Observer',
    optionC: 'Singleton',
    optionD: 'Strategy',
    correctAnswer: 'C',
    category: 'Design Patterns',
  },
  {
    id: 'MCQ-008',
    questionText: 'What does API stand for?',
    optionA: 'Application Programming Interface',
    optionB: 'Automated Program Interaction',
    optionC: 'Advanced Protocol Integration',
    optionD: 'Application Process Interface',
    correctAnswer: 'A',
    category: 'General',
  },
  {
    id: 'MCQ-009',
    questionText: 'In Git, which command is used to create a new branch?',
    optionA: 'git new-branch',
    optionB: 'git branch',
    optionC: 'git checkout',
    optionD: 'git create',
    correctAnswer: 'B',
    category: 'Version Control',
  },
  {
    id: 'MCQ-010',
    questionText: 'What is the default port for HTTPS?',
    optionA: '80',
    optionB: '8080',
    optionC: '443',
    optionD: '3000',
    correctAnswer: 'C',
    category: 'Networking',
  },
];

// Mock student attempts (which questions the current student has seen)
export let mockAttempts = [
  {
    studentId: 'student-1',
    questionId: 'MCQ-001',
    attemptDate: '2026-03-01',
    isCorrect: true,
  },
  {
    studentId: 'student-1',
    questionId: 'MCQ-003',
    attemptDate: '2026-03-01',
    isCorrect: true,
  },
  {
    studentId: 'student-1',
    questionId: 'MCQ-005',
    attemptDate: '2026-03-01',
    isCorrect: false,
  },
  {
    studentId: 'student-1',
    questionId: 'MCQ-007',
    attemptDate: '2026-03-01',
    isCorrect: true,
  },
  {
    studentId: 'student-1',
    questionId: 'MCQ-009',
    attemptDate: '2026-03-01',
    isCorrect: true,
  },
];

// Helper functions to manage data
export const getUnseenQuestions = (studentId) => {
  const seenIds = mockAttempts
    .filter((attempt) => attempt.studentId === studentId)
    .map((attempt) => attempt.questionId);
  
  return mockMCQs.filter((mcq) => !seenIds.includes(mcq.id));
};

export const getRandomUnseenQuestion = (studentId) => {
  const unseenQuestions = getUnseenQuestions(studentId);
  if (unseenQuestions.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * unseenQuestions.length);
  return unseenQuestions[randomIndex];
};

export const recordAttempt = (studentId, questionId, isCorrect) => {
  mockAttempts.push({
    studentId,
    questionId,
    attemptDate: new Date().toISOString().split('T')[0],
    isCorrect,
  });
  
  // Update daily completed count
  const user = mockUsers.find((u) => u.id === studentId);
  if (user) {
    user.dailyCompleted += 1;
    if (isCorrect) {
      user.score += 10; // Award points for correct answer
    }
  }
  
  if (currentStudent.id === studentId) {
    currentStudent.dailyCompleted += 1;
    if (isCorrect) {
      currentStudent.score += 10;
    }
  }
};

export const getLatestScore = (studentId) => {
  const recentAttempts = mockAttempts
    .filter((attempt) => attempt.studentId === studentId)
    .slice(-5); // Last 5 attempts
  
  const correctCount = recentAttempts.filter((attempt) => attempt.isCorrect).length;
  return Math.round((correctCount / Math.max(recentAttempts.length, 1)) * 100);
};

export const addMCQ = (mcq) => {
  mockMCQs.push(mcq);
};

export const updateMCQ = (id, updatedMcq) => {
  const index = mockMCQs.findIndex((mcq) => mcq.id === id);
  if (index !== -1) {
    mockMCQs[index] = updatedMcq;
  }
};

export const deleteMCQ = (id) => {
  mockMCQs = mockMCQs.filter((mcq) => mcq.id !== id);
};

export const addUser = (user) => {
  mockUsers.push(user);
};

export const updateUser = (id, updatedUser) => {
  const index = mockUsers.findIndex((user) => user.id === id);
  if (index !== -1) {
    mockUsers[index] = updatedUser;
  }
};

export const deleteUser = (id) => {
  mockUsers = mockUsers.filter((user) => user.id !== id);
};

// Analytics helper
export const getAnalytics = () => {
  const totalStudents = mockUsers.filter((u) => u.role === 'student').length;
  const totalQuestions = mockMCQs.length;
  const totalAttempts = mockAttempts.length;
  const averageScore = Math.round(
    mockUsers
      .filter((u) => u.role === 'student')
      .reduce((sum, user) => sum + user.score, 0) / totalStudents
  );
  
  return {
    totalStudents,
    totalQuestions,
    totalAttempts,
    averageScore,
  };
};

