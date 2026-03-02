import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { GraduationCap, BookOpen, Users } from 'lucide-react';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/student/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
            <GraduationCap className="w-8 h-8 text-gray-700" />
          </div>
          <h1 className="text-4xl font-semibold text-gray-900 mb-3">
            Learning Management System
          </h1>
          <p className="text-base text-gray-600">
            Choose your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <button
            onClick={() => navigate('/login')}
            className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-5 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl mb-6 group-hover:opacity-90 transition-all">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Student Portal</h2>
              <p className="text-sm text-gray-600 mb-6">
                Access your daily quizzes, track progress, and improve your knowledge
              </p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Take daily MCQ challenges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Track your performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>View your score history</span>
                </div>
              </div>
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => navigate('/admin/login')}
            className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-5 bg-gradient-to-br from-[#00c6ff] to-[#0072ff] rounded-xl mb-6 group-hover:opacity-90 transition-all">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Admin Panel</h2>
              <p className="text-sm text-gray-600 mb-6">
                Manage users, questions, notifications, and view analytics
              </p>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Manage student accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>Create and edit questions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>View platform analytics</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Built with React • Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

