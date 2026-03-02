import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../common/ProgressRing';
import { useAuth } from '../../context/AuthContext';
import { userAPI, mcqAPI } from '../../services/api';
import { Button } from '../ui/button';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserStats();
  }, [user, navigate]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const stats = await userAPI.getUserStats(user.id);
      setUserStats(stats);
    } catch (err) {
      setError(err.message);
      console.error('Error loading user stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !userStats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600">Error: {error || 'Failed to load data'}</div>
        </div>
      </div>
    );
  }

  const dailyCompleted = userStats.dailyCount || 0;
  const dailyLimit = userStats.dailyLimit || 10;
  const remainingToday = userStats.remainingToday || 0;
  const canTakeQuiz = dailyCompleted < dailyLimit && remainingToday > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold mb-2">Welcome back, {userStats.name}!</h1>
          <p className="text-white/90">Ready to challenge yourself today?</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Daily MCQ Progress</h3>
              <ProgressRing 
                completed={dailyCompleted} 
                total={dailyLimit}
                size={140}
                strokeWidth={10}
              />
              <p className="text-sm text-gray-500 mt-6 text-center">
                {remainingToday} questions remaining today
              </p>
            </div>
          </div>

          {/* Start Quiz Card */}
          <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-[0_4px_24px_rgba(102,126,234,0.2)] p-8 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">Start Quiz</h3>
              </div>
              <p className="text-white/90 mb-6 flex-1">
                {canTakeQuiz 
                  ? 'Begin your next challenge and boost your knowledge!'
                  : remainingToday === 0
                    ? "You've reached your daily limit. Come back tomorrow!"
                    : "You've completed all available questions!"
                }
              </p>
              <Button 
                onClick={() => navigate('/quiz')}
                disabled={!canTakeQuiz}
                className="w-full bg-white text-[#667eea] hover:bg-white/90 rounded-xl h-12 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canTakeQuiz ? 'Start Now' : 'Completed'}
              </Button>
            </div>
          </div>

          {/* Latest Score Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100 md:col-span-2 lg:col-span-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-[#00c6ff] to-[#0072ff] rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Latest Performance</h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <div className="text-5xl font-semibold bg-gradient-to-br from-[#00c6ff] to-[#0072ff] bg-clip-text text-transparent">
                  {userStats.score || 0}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Total points earned
              </p>
            </div>
          </div>

          {/* Total Score Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100 md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] rounded-2xl">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Total Score</h3>
                  <p className="text-sm text-gray-500">Your cumulative points</p>
                </div>
              </div>
              <div className="text-5xl font-semibold bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] bg-clip-text text-transparent">
                {userStats.score || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {dailyCompleted}
            </div>
            <div className="text-sm text-gray-500">Completed Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {remainingToday}
            </div>
            <div className="text-sm text-gray-500">Remaining Today</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {dailyLimit}
            </div>
            <div className="text-sm text-gray-500">Daily Limit</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {userStats.score || 0}
            </div>
            <div className="text-sm text-gray-500">Total Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}

