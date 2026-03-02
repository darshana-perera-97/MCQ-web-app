import { useState, useEffect } from 'react';
import { analyticsAPI, getAdminSecret } from '../../services/api';
import { Users, BookOpen, Target, TrendingUp, UserCheck, UserX, Clock, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalQuestions: 0,
    totalAttempts: 0,
    averageScore: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    rejectedUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    todayActiveUsers: 0
  });
  const [studentData, setStudentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const adminSecret = getAdminSecret();
      const response = await analyticsAPI.getAnalytics(adminSecret);

      setAnalytics({
        totalStudents: response.totalStudents || 0,
        totalQuestions: response.totalQuestions || 0,
        totalAttempts: response.totalAttempts || 0,
        averageScore: response.averageScore || 0,
        pendingUsers: response.pendingUsers || 0,
        approvedUsers: response.approvedUsers || 0,
        rejectedUsers: response.rejectedUsers || 0,
        activeUsers: response.activeUsers || 0,
        inactiveUsers: response.inactiveUsers || 0,
        todayActiveUsers: response.todayActiveUsers || 0
      });

      // Top 5 students by score
      const topStudents = (response.topStudents || []).map(u => ({
        name: u.name?.split(' ')[0] || 'User',
        score: u.score || 0,
        completed: u.completed || 0
      }));
      setStudentData(topStudents);

      // Category distribution
      setCategoryData(response.categoryData || []);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setStudentData([]);
      setCategoryData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#667eea', '#764ba2', '#00c6ff', '#0072ff', '#84fab0', '#8fd3f4', '#f093fb', '#4facfe'];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Quick overview of your platform's key metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-90" />
            <div className="text-3xl font-bold">{analytics.totalStudents}</div>
          </div>
          <div className="text-sm opacity-90">Total Students</div>
          <div className="text-xs opacity-75 mt-1">
            {analytics.approvedUsers} approved • {analytics.pendingUsers} pending
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#00c6ff] to-[#0072ff] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 opacity-90" />
            <div className="text-3xl font-bold">{analytics.totalQuestions}</div>
          </div>
          <div className="text-sm opacity-90">Total Questions</div>
          <div className="text-xs opacity-75 mt-1">
            {categoryData.length} categories
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-90" />
            <div className="text-3xl font-bold">{analytics.totalAttempts}</div>
          </div>
          <div className="text-sm opacity-90">Total Attempts</div>
          <div className="text-xs opacity-75 mt-1">
            {analytics.todayActiveUsers} active today
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#764ba2] to-[#667eea] rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-90" />
            <div className="text-3xl font-bold">{analytics.averageScore}</div>
          </div>
          <div className="text-sm opacity-90">Average Score</div>
          <div className="text-xs opacity-75 mt-1">
            Across all students
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div 
          className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/admin/users')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-yellow-900">{analytics.pendingUsers}</div>
              <div className="text-sm text-yellow-700">Pending Approval</div>
            </div>
          </div>
          {analytics.pendingUsers > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span>Action required</span>
            </div>
          )}
        </div>

        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-green-900">{analytics.approvedUsers}</div>
              <div className="text-sm text-green-700">Approved Users</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-blue-900">{analytics.activeUsers}</div>
              <div className="text-sm text-blue-700">Active Users</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-500 rounded-lg">
              <UserX className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-gray-900">{analytics.inactiveUsers}</div>
              <div className="text-sm text-gray-700">Inactive Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Students Chart */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top 5 Students</h3>
            <button
              onClick={() => navigate('/admin/analytics')}
              className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium"
            >
              View All →
            </button>
          </div>
          {studentData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No student data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={studentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="score" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Questions by Category</h3>
            <button
              onClick={() => navigate('/admin/questions')}
              className="text-sm text-[#667eea] hover:text-[#764ba2] font-medium"
            >
              Manage →
            </button>
          </div>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-gray-500">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No category data available</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#667eea] hover:bg-[#667eea]/5 transition-all text-left"
          >
            <Users className="w-5 h-5 text-[#667eea]" />
            <div>
              <div className="font-medium text-gray-900">Manage Users</div>
              <div className="text-sm text-gray-500">View and manage students</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/questions')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#00c6ff] hover:bg-[#00c6ff]/5 transition-all text-left"
          >
            <BookOpen className="w-5 h-5 text-[#00c6ff]" />
            <div>
              <div className="font-medium text-gray-900">Edit Questions</div>
              <div className="text-sm text-gray-500">Add or modify MCQs</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#764ba2] hover:bg-[#764ba2]/5 transition-all text-left"
          >
            <TrendingUp className="w-5 h-5 text-[#764ba2]" />
            <div>
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">Detailed reports</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/notifications')}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-[#84fab0] hover:bg-[#84fab0]/5 transition-all text-left"
          >
            <Activity className="w-5 h-5 text-[#84fab0]" />
            <div>
              <div className="font-medium text-gray-900">Send Notifications</div>
              <div className="text-sm text-gray-500">Notify students</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

