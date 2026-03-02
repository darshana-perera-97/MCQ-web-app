import { useState, useEffect } from 'react';
import { analyticsAPI, getAdminSecret } from '../../services/api';
import { Users, BookOpen, Target, TrendingUp, UserCheck, UserX, Clock, Activity } from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';

export function Analytics() {
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
  const [dailyData, setDailyData] = useState([]);
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

      // Weekly activity
      setDailyData(response.dailyData || [
        { day: 'Mon', attempts: 0 },
        { day: 'Tue', attempts: 0 },
        { day: 'Wed', attempts: 0 },
        { day: 'Thu', attempts: 0 },
        { day: 'Fri', attempts: 0 },
        { day: 'Sat', attempts: 0 },
        { day: 'Sun', attempts: 0 },
      ]);
    } catch (err) {
      console.error('Error loading analytics:', err);
      // Set empty data on error
      setStudentData([]);
      setCategoryData([]);
      setDailyData([
        { day: 'Mon', attempts: 0 },
        { day: 'Tue', attempts: 0 },
        { day: 'Wed', attempts: 0 },
        { day: 'Thu', attempts: 0 },
        { day: 'Fri', attempts: 0 },
        { day: 'Sat', attempts: 0 },
        { day: 'Sun', attempts: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  const COLORS = ['#667eea', '#764ba2', '#00c6ff', '#0072ff', '#84fab0', '#8fd3f4', '#f093fb', '#4facfe'];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Monitor platform performance and student engagement</p>
      </div>

      {/* Basic Stats Grid - Primary Metrics */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalStudents}</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#00c6ff] to-[#0072ff] rounded-2xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalQuestions}</div>
                <div className="text-sm text-gray-500">Total Questions</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] rounded-2xl">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{analytics.totalAttempts}</div>
                <div className="text-sm text-gray-500">Total Attempts</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#764ba2] to-[#667eea] rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">{analytics.averageScore}</div>
                <div className="text-sm text-gray-500">Average Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Status Stats */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-yellow-50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-yellow-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-yellow-500 rounded-2xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-yellow-900">{analytics.pendingUsers}</div>
                <div className="text-sm text-yellow-700">Pending Approval</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-green-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-500 rounded-2xl">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-green-900">{analytics.approvedUsers}</div>
                <div className="text-sm text-green-700">Approved Users</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-red-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-red-500 rounded-2xl">
                <UserX className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-red-900">{analytics.rejectedUsers}</div>
                <div className="text-sm text-red-700">Rejected Users</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-blue-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-500 rounded-2xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-blue-900">{analytics.todayActiveUsers}</div>
                <div className="text-sm text-blue-700">Active Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold text-gray-900">{analytics.activeUsers}</div>
                <div className="text-sm text-gray-500 mt-1">Active Users</div>
                <div className="text-xs text-gray-400 mt-1">Users who have attempted questions</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] rounded-2xl">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold text-gray-900">{analytics.inactiveUsers}</div>
                <div className="text-sm text-gray-500 mt-1">Inactive Users</div>
                <div className="text-xs text-gray-400 mt-1">Users who haven't attempted yet</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-[#9ca3af] to-[#6b7280] rounded-2xl">
                <UserX className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Students Chart */}
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Students by Score</h3>
          {studentData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No student data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={studentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Questions by Category</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No category data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
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

      {/* Weekly Attempts Chart */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="attempts"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{ fill: '#667eea', r: 5 }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Student Progress Table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress Overview</h3>
        <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Attempts</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No student data available
                    </td>
                  </tr>
                ) : (
                  studentData.map((user, index) => (
                    <tr key={`${user.name}-${index}`} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-[#84fab0]/20 to-[#8fd3f4]/20">
                          <span className="font-semibold bg-gradient-to-r from-[#84fab0] to-[#8fd3f4] bg-clip-text text-transparent">
                            {user.score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {user.completed} questions
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${
                            user.completed > 0
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.completed > 0 ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

