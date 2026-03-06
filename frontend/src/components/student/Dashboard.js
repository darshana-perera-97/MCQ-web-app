import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../common/ProgressRing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI, mcqAPI, essayAPI, notificationAPI } from '../../services/api';
import { Button } from '../ui/button';
import { BookOpen, TrendingUp, Award, LogOut, FileText, Bell, PenTool, FileCheck, Languages } from 'lucide-react';
import { MaterialsModal } from './MaterialsModal';
import { EssaysModal } from './EssaysModal';
import { NotificationsDrawer } from './NotificationsDrawer';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materialsModalOpen, setMaterialsModalOpen] = useState(false);
  const [essaysModalOpen, setEssaysModalOpen] = useState(false);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [essays, setEssays] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserStats();
    loadNotificationPreferences();
    loadEssays();
    checkNewNotifications();
  }, [user, navigate]);

  useEffect(() => {
    // Check for new notifications every 5 minutes
    const interval = setInterval(() => {
      checkNewNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const loadEssays = async () => {
    try {
      const response = await essayAPI.getAll();
      setEssays(response.essays || []);
    } catch (err) {
      console.error('Error loading essays:', err);
    }
  };

  const checkNewNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      const notifications = response.notifications || [];
      const now = new Date();
      const hasNew = notifications.some((notification) => {
        const notificationDate = new Date(notification.createdAt);
        const diffInHours = (now - notificationDate) / (1000 * 60 * 60);
        return diffInHours < 24; // Less than 24 hours old
      });
      setHasNewNotifications(hasNew);
    } catch (err) {
      console.error('Error checking notifications:', err);
    }
  };

  const loadNotificationPreferences = () => {
    if (user) {
      // Notifications are enabled if both email and WhatsApp are enabled (default to true)
      const emailEnabled = user.emailNotifications !== false;
      const whatsappEnabled = user.whatsappNotifications !== false;
      setNotificationsEnabled(emailEnabled && whatsappEnabled);
    }
  };

  const handleNotificationToggle = async (enabled) => {
    if (!user) return;

    const oldValue = notificationsEnabled;
    setNotificationsEnabled(enabled);

    try {
      setSavingPreferences(true);
      await userAPI.updateNotificationPreferences(user.id, {
        emailNotifications: enabled,
        whatsappNotifications: enabled,
      });
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      // Revert on error
      setNotificationsEnabled(oldValue);
    } finally {
      setSavingPreferences(false);
    }
  };

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
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-1 sm:mb-2">
              {language === 'si' ? 'සාදරයෙන් පිළිගනිමු' : 'Welcome'}, {userStats.name}!
            </h1>
            <p className="text-white/90 text-sm sm:text-base">
              {language === 'si' ? 'අද ඔබට අභියෝග කිරීමට සූදානම්ද?' : 'Ready to challenge yourself today?'}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={toggleLanguage}
              className="bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 font-medium shadow-sm transition-all border border-white/30"
              title={language === 'si' ? 'Switch to English' : 'සිංහලට මාරු වන්න'}
            >
              <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium">{language === 'si' ? 'EN' : 'සිං'}</span>
            </Button>
            <Button
              onClick={() => {
                setNotificationsDrawerOpen(true);
                setHasNewNotifications(false); // Clear the glow when drawer is opened
              }}
              className={`bg-white text-[#667eea] hover:bg-white/90 flex items-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 font-medium shadow-sm transition-all relative ${
                hasNewNotifications ? 'ring-2 ring-[#667eea] ring-offset-2 animate-pulse' : ''
              }`}
              title={language === 'si' ? 'දැනුම්දීම් බලන්න' : 'View notifications'}
            >
              <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${hasNewNotifications ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{language === 'si' ? 'දැනුම්දීම්' : 'Notifications'}</span>
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping"></span>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-white text-[#667eea] hover:bg-white/90 flex items-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 font-medium shadow-sm transition-all"
              title={language === 'si' ? 'පිටවීම' : 'Logout'}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{language === 'si' ? 'පිටවීම' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 border border-gray-100">
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-medium text-gray-900 mb-6">{language === 'si' ? 'දිනපතා MCQ ප්‍රගතිය' : 'Daily MCQ Progress'}</h3>
              <ProgressRing 
                completed={dailyCompleted} 
                total={dailyLimit}
                size={140}
                strokeWidth={10}
              />
              <p className="text-sm text-gray-500 mt-6 text-center">
                {language === 'si' 
                  ? `${remainingToday} ප්‍රශ්න අදට ඉතිරිව ඇත`
                  : `${remainingToday} questions remaining today`}
              </p>
            </div>
          </div>

          {/* Start Quiz Card - MCQs Only */}
          <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl shadow-[0_4px_24px_rgba(102,126,234,0.2)] p-8 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">{language === 'si' ? 'විභාගය ආරම්භ කරන්න' : 'Start Quiz'}</h3>
              </div>
              <p className="text-white/90 mb-6 flex-1">
                {canTakeQuiz 
                  ? (language === 'si' ? 'MCQ ප්‍රශ්න පුහුණු කර ඔබේ දැනුම පරීක්ෂා කරන්න!' : 'Practice MCQ questions and test your knowledge!')
                  : remainingToday === 0
                    ? (language === 'si' ? 'ඔබ දිනපතා සීමාවට ළඟා වී ඇත. හෙට නැවත එන්න!' : "You've reached your daily limit. Come back tomorrow!")
                    : (language === 'si' ? 'ඔබ සියලුම ප්‍රශ්න සම්පූර්ණ කර ඇත!' : "You've completed all available questions!")
                }
              </p>
              <Button 
                onClick={() => navigate('/quiz')}
                disabled={!canTakeQuiz}
                className="w-full bg-white text-[#667eea] hover:bg-white/90 rounded-xl h-12 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canTakeQuiz ? (language === 'si' ? 'MCQ විභාගය ආරම්භ කරන්න' : 'Start MCQ Quiz') : (language === 'si' ? 'සම්පූර්ණ' : 'Completed')}
              </Button>
            </div>
          </div>

          {/* Materials Card */}
          <div className="bg-gradient-to-br from-[#f093fb] to-[#f5576c] rounded-2xl shadow-[0_4px_24px_rgba(245,87,108,0.2)] p-8 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">{language === 'si' ? 'අධ්‍යයන ද්‍රව්‍ය' : 'Study Materials'}</h3>
              </div>
              <p className="text-white/90 mb-6 flex-1">
                {language === 'si' 
                  ? 'ඔබේ ගුරුවරුන් විසින් උඩුගත කරන ලද PDF, සටහන් සහ අධ්‍යයන සම්පත් ප්‍රවේශ වන්න.'
                  : 'Access PDFs, notes, and study resources uploaded by your instructors.'}
              </p>
              <Button 
                onClick={() => setMaterialsModalOpen(true)}
                className="w-full bg-white text-[#f5576c] hover:bg-white/90 rounded-xl h-12 font-medium"
              >
                {language === 'si' ? 'ද්‍රව්‍ය බලන්න' : 'View Materials'}
              </Button>
            </div>
          </div>

          {/* Essay Questions Card */}
          <div className="bg-gradient-to-br from-[#fa709a] to-[#fee140] rounded-2xl shadow-[0_4px_24px_rgba(250,112,154,0.2)] p-8 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <PenTool className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">{language === 'si' ? 'රචනා ප්‍රශ්න' : 'Essay Questions'}</h3>
              </div>
              <p className="text-white/90 mb-6 flex-1">
                {language === 'si' 
                  ? 'රචනා වර්ගයේ ප්‍රශ්න පුහුණු කර ඔබේ ලිවීමේ කුසලතා වැඩි දියුණු කරන්න.'
                  : 'Practice essay type questions and improve your writing skills.'}
              </p>
              <div className="mb-4">
                <div className="text-sm text-white/80 mb-1">{language === 'si' ? 'ලබා ගත හැකි ප්‍රශ්න' : 'Available Questions'}</div>
                <div className="text-2xl font-semibold">{essays.length}</div>
              </div>
              <Button 
                onClick={() => setEssaysModalOpen(true)}
                className="w-full bg-white text-[#fa709a] hover:bg-white/90 rounded-xl h-12 font-medium"
              >
                {language === 'si' ? 'රචනා බලන්න' : 'View Essays'}
              </Button>
            </div>
          </div>

          {/* Summarize Card */}
          <div className="bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-2xl shadow-[0_4px_24px_rgba(79,172,254,0.2)] p-8 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-medium">{language === 'si' ? 'සාරාංශ' : 'Summarize'}</h3>
              </div>
              <p className="text-white/90 mb-6 flex-1">
                {language === 'si' 
                  ? 'සාරාංශ අභ්‍යාස සම්පූර්ණ කර ඔබේ අවබෝධය සහ ලිවීමේ කුසලතා වැඩි දියුණු කරන්න.'
                  : 'Complete summary exercises to improve your comprehension and writing skills.'}
              </p>
              <Button 
                onClick={() => navigate('/student/summarize')}
                className="w-full bg-white text-[#4facfe] hover:bg-white/90 rounded-xl h-12 font-medium"
              >
                {language === 'si' ? 'සාරාංශ බලන්න' : 'View Summaries'}
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
                <h3 className="text-lg font-medium text-gray-900">{language === 'si' ? 'නවතම කාර්ය සාධනය' : 'Latest Performance'}</h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <div className="text-5xl font-semibold bg-gradient-to-br from-[#00c6ff] to-[#0072ff] bg-clip-text text-transparent">
                  {userStats.score || 0}
                </div>
              </div>
              <p className="text-sm text-gray-500">
                {language === 'si' ? 'උපයන ලද මුළු ලකුණු' : 'Total points earned'}
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
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{language === 'si' ? 'මුළු ලකුණු' : 'Total Score'}</h3>
                  <p className="text-sm text-gray-500">{language === 'si' ? 'ඔබේ සමුච්චිත ලකුණු' : 'Your cumulative points'}</p>
                </div>
              </div>
              <div className="text-5xl font-semibold bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] bg-clip-text text-transparent">
                {userStats.score || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Bar */}
        <div className="mt-8 w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-2xl shadow-[0_4px_24px_rgba(102,126,234,0.2)] p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-1">{language === 'si' ? 'ඉගෙනීම දිගටම කරගෙන යන්න!' : 'Keep Learning!'}</h3>
              <p className="text-white/90">{language === 'si' ? 'ඔබේ ලකුණු සහ දැනුම වැඩි දියුණු කිරීමට පුහුණු වීම දිගටම කරගෙන යන්න' : 'Continue practicing to improve your score and knowledge'}</p>
            </div>
            <Button 
              onClick={() => navigate('/quiz')}
              disabled={!canTakeQuiz}
              className="bg-white text-[#667eea] hover:bg-white/90 rounded-xl h-12 px-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canTakeQuiz ? (language === 'si' ? 'දැන් විභාගය ආරම්භ කරන්න' : 'Start Quiz Now') : (language === 'si' ? 'සම්පූර්ණ' : 'Completed')}
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#667eea]" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{language === 'si' ? 'දැනුම්දීම්' : 'Notifications'}</h3>
                <p className="text-sm text-gray-600">{language === 'si' ? 'විද්‍යුත් තැපෑල සහ WhatsApp හරහා දැනුම්දීම් ලබා ගන්න' : 'Receive notifications via email and WhatsApp'}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => handleNotificationToggle(e.target.checked)}
                disabled={savingPreferences}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#667eea]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#667eea] peer-checked:to-[#764ba2] peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {dailyCompleted}
            </div>
            <div className="text-sm text-gray-500">{language === 'si' ? 'අද සම්පූර්ණ කරන ලදී' : 'Completed Today'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {remainingToday}
            </div>
            <div className="text-sm text-gray-500">{language === 'si' ? 'අදට ඉතිරි' : 'Remaining Today'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {dailyLimit}
            </div>
            <div className="text-sm text-gray-500">{language === 'si' ? 'දිනපතා සීමාව' : 'Daily Limit'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 border border-gray-100">
            <div className="text-2xl font-semibold text-gray-900 mb-1">
              {userStats.score || 0}
            </div>
            <div className="text-sm text-gray-500">{language === 'si' ? 'මුළු ලකුණු' : 'Total Score'}</div>
          </div>
        </div>
      </div>

      {/* Materials Modal */}
      <MaterialsModal 
        open={materialsModalOpen} 
        onOpenChange={setMaterialsModalOpen} 
      />

      {/* Essays Modal */}
      <EssaysModal 
        open={essaysModalOpen} 
        onOpenChange={setEssaysModalOpen} 
      />

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
      />
    </div>
  );
}

