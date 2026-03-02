import { UserModel } from '../models/UserModel.js';
import { McqModel } from '../models/McqModel.js';
import { SettingsModel } from '../models/SettingsModel.js';

const userModel = new UserModel();
const mcqModel = new McqModel();
const settingsModel = new SettingsModel();

export const getAnalytics = async (req, res) => {
  try {
    const users = await userModel.findAll();
    const mcqs = await mcqModel.findAll();
    const students = users.filter(u => u.role === 'student' || !u.role);

    // Calculate total attempts (sum of all seenMcqs lengths)
    const totalAttempts = students.reduce((sum, u) => sum + (u.seenMcqs?.length || 0), 0);
    
    // Calculate average score
    const totalScore = students.reduce((sum, u) => sum + (u.score || 0), 0);
    const averageScore = students.length > 0 ? Math.round(totalScore / students.length) : 0;

    // Top 5 students by score
    const topStudents = students
      .map(u => ({
        id: u.id,
        name: u.name || 'Unknown',
        score: u.score || 0,
        completed: u.dailyCount || 0,
        seenMcqs: u.seenMcqs?.length || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Category distribution from MCQs
    const categoryCount = {};
    mcqs.forEach(mcq => {
      const category = mcq.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Weekly activity - calculate based on dailyCount and lastAttemptDate
    // For each student, distribute their attempts across the week
    const weeklyActivity = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };

    // Get today's date
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    students.forEach(student => {
      const totalAttempts = student.seenMcqs?.length || 0;
      
      if (totalAttempts > 0 && student.lastAttemptDate) {
        // Calculate days since first attempt (estimate)
        const lastDate = new Date(student.lastAttemptDate);
        const daysDiff = Math.ceil((today - lastDate) / (1000 * 60 * 60 * 24));
        const daysActive = Math.max(1, Math.min(daysDiff, 7)); // Cap at 7 days
        
        // Distribute attempts across active days
        const attemptsPerDay = Math.ceil(totalAttempts / daysActive);
        
        // Add more weight to recent days
        for (let i = 0; i < daysActive && i < 7; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const dayName = dayNames[checkDate.getDay()];
          
          if (weeklyActivity[dayName] !== undefined) {
            // More weight on recent days
            const weight = (7 - i) / 7;
            weeklyActivity[dayName] += Math.ceil(attemptsPerDay * weight);
          }
        }
      }
    });

    // Convert to array format for chart (ensure we have all days)
    const dailyData = [
      { day: 'Mon', attempts: Math.max(0, weeklyActivity.Mon) },
      { day: 'Tue', attempts: Math.max(0, weeklyActivity.Tue) },
      { day: 'Wed', attempts: Math.max(0, weeklyActivity.Wed) },
      { day: 'Thu', attempts: Math.max(0, weeklyActivity.Thu) },
      { day: 'Fri', attempts: Math.max(0, weeklyActivity.Fri) },
      { day: 'Sat', attempts: Math.max(0, weeklyActivity.Sat) },
      { day: 'Sun', attempts: Math.max(0, weeklyActivity.Sun) },
    ];

    res.json({
      totalStudents: students.length,
      totalQuestions: mcqs.length,
      totalAttempts,
      averageScore,
      topStudents,
      categoryData,
      dailyData
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

