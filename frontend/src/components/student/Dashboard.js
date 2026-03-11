import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../common/ProgressRing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { userAPI, mcqAPI, essayAPI, summaryAPI, notificationAPI, structuredQuestionAPI, structuredWritingAPI } from '../../services/api';
import { Button } from '../ui/button';
import { BookOpen, TrendingUp, Award, LogOut, FileText, Bell, PenTool, FileCheck, Languages, ChevronLeft, ChevronRight } from 'lucide-react';
import { NotificationsDrawer } from './NotificationsDrawer';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();

  // Shared random light color palette for dashboard cards
  const getCardColor = (index) => {
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconBorder: 'border-blue-200', iconText: 'text-blue-700' },
      { bg: 'bg-indigo-50', border: 'border-indigo-100', iconBg: 'bg-indigo-100', iconBorder: 'border-indigo-200', iconText: 'text-indigo-700' },
      { bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100', iconBorder: 'border-green-200', iconText: 'text-green-700' },
      { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconBorder: 'border-purple-200', iconText: 'text-purple-700' },
      { bg: 'bg-pink-50', border: 'border-pink-100', iconBg: 'bg-pink-100', iconBorder: 'border-pink-200', iconText: 'text-pink-700' },
      { bg: 'bg-orange-50', border: 'border-orange-100', iconBg: 'bg-orange-100', iconBorder: 'border-orange-200', iconText: 'text-orange-700' },
      { bg: 'bg-cyan-50', border: 'border-cyan-100', iconBg: 'bg-cyan-100', iconBorder: 'border-cyan-200', iconText: 'text-cyan-700' },
      { bg: 'bg-yellow-50', border: 'border-yellow-100', iconBg: 'bg-yellow-100', iconBorder: 'border-yellow-200', iconText: 'text-yellow-700' },
      { bg: 'bg-teal-50', border: 'border-teal-100', iconBg: 'bg-teal-100', iconBorder: 'border-teal-200', iconText: 'text-teal-700' },
      { bg: 'bg-rose-50', border: 'border-rose-100', iconBg: 'bg-rose-100', iconBorder: 'border-rose-200', iconText: 'text-rose-700' },
    ];
    return colors[index % colors.length];
  };

  // Set to true to show the Latest Performance card
  const SHOW_LATEST_PERFORMANCE_CARD = false;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [userStats, setUserStats] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationsDrawerOpen, setNotificationsDrawerOpen] = useState(false);
  const [essays, setEssays] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationSlideIndex, setNotificationSlideIndex] = useState(0);
  const [structuredQuestions, setStructuredQuestions] = useState([]);
  const [structuredWritings, setStructuredWritings] = useState([]);
  const [summaries, setSummaries] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserStats();
    loadProgress();
    loadNotificationPreferences();
    loadEssays();
    loadSummaries();
    loadStructuredQuestions();
    loadStructuredWritings();
    checkNewNotifications();
  }, [user, navigate]);

  useEffect(() => {
    // Check for new notifications every 5 minutes
    const interval = setInterval(() => {
      checkNewNotifications();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 0 && notificationSlideIndex >= notifications.length) {
      setNotificationSlideIndex(notifications.length - 1);
    }
  }, [notifications.length, notificationSlideIndex]);

  const loadEssays = async () => {
    try {
      const response = await essayAPI.getAll();
      setEssays(response.essays || []);
    } catch (err) {
      console.error('Error loading essays:', err);
    }
  };

  const loadSummaries = async () => {
    try {
      const response = await summaryAPI.getAll();
      setSummaries(response.summaries || []);
    } catch (err) {
      console.error('Error loading summaries:', err);
    }
  };

  const loadStructuredQuestions = async () => {
    try {
      const response = await structuredQuestionAPI.getAll();
      setStructuredQuestions(response.structuredQuestions || []);
    } catch (err) {
      console.error('Error loading structured questions:', err);
    }
  };

  const loadStructuredWritings = async () => {
    try {
      const response = await structuredWritingAPI.getAll();
      setStructuredWritings(response.structuredWritings || []);
    } catch (err) {
      console.error('Error loading structured writings:', err);
    }
  };

  const checkNewNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      const list = (response.notifications || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setNotifications(list);
      const now = new Date();
      const hasNew = list.some((n) => {
        const diffInHours = (now - new Date(n.createdAt)) / (1000 * 60 * 60);
        return diffInHours < 24;
      });
      setHasNewNotifications(hasNew);
    } catch (err) {
      console.error('Error checking notifications:', err);
    }
  };

  const formatNotificationDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const loadProgress = async () => {
    if (!user?.id) return;
    try {
      const data = await userAPI.getProgress(user.id);
      setProgressData(data);
    } catch (err) {
      console.error('Error loading progress:', err);
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
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 tracking-tight text-gray-900">
              {language === 'si' ? 'සාදරයෙන් පිළිගනිමු' : 'Welcome'}, {userStats.name}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base font-normal">
              {language === 'si' ? 'අද ඔබට අභියෝග කිරීමට සූදානම්ද?' : 'Ready to challenge yourself today?'}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={toggleLanguage}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2 font-medium transition-all border border-gray-200"
              title={language === 'si' ? 'Switch to English' : 'සිංහලට මාරු වන්න'}
            >
              <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">{language === 'si' ? 'EN' : 'සිං'}</span>
            </Button>
            <Button
              onClick={() => {
                setNotificationsDrawerOpen(true);
                setHasNewNotifications(false);
              }}
              className={`bg-gray-50 hover:bg-gray-100 text-gray-700 flex items-center gap-2 rounded-lg px-3 sm:px-5 py-2 font-medium transition-all border border-gray-200 relative ${
                hasNewNotifications ? 'ring-2 ring-gray-300' : ''
              }`}
              title={language === 'si' ? 'දැනුම්දීම් බලන්න' : 'View notifications'}
            >
              <Bell className={`w-4 h-4 sm:w-5 sm:h-5 ${hasNewNotifications ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{language === 'si' ? 'දැනුම්දීම්' : 'Notifications'}</span>
              {hasNewNotifications && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-gray-900 hover:bg-gray-800 text-white flex items-center gap-2 rounded-lg px-3 sm:px-5 py-2 font-medium transition-all"
              title={language === 'si' ? 'පිටවීම' : 'Logout'}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{language === 'si' ? 'පිටවීම' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Progress Card */}
          {(() => {
            const color = getCardColor(0);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-900 mb-8">{language === 'si' ? 'දිනපතා MCQ ප්‍රගතිය' : 'Daily MCQ Progress'}</h3>
              <ProgressRing 
                completed={dailyCompleted} 
                total={dailyLimit}
                size={140}
                strokeWidth={10}
              />
              <p className="text-sm text-gray-600 mt-6 text-center font-normal">
                {language === 'si' 
                  ? `${remainingToday} ප්‍රශ්න අදට ඉතිරිව ඇත`
                  : `${remainingToday} questions remaining today`}
              </p>
            </div>
          </div>
          );
          })()}

          {/* Your Progress - overall completion across system (hidden on mobile) */}
          {(() => {
            const color = getCardColor(1);
            const totalAll = progressData?.totalAll ?? 0;
            const completedAll = progressData?.completedAll ?? 0;
            const overallPct = totalAll > 0 ? progressData?.overallPercentage ?? 0 : 0;
            const displayTotal = Math.max(totalAll, 1);
            return (
          <div className={`hidden md:block ${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-900 mb-8">{language === 'si' ? 'ඔබේ ප්‍රගතිය' : 'Your Progress'}</h3>
              <ProgressRing 
                completed={completedAll} 
                total={displayTotal}
                size={140}
                strokeWidth={10}
                centerLabel="percentage"
              />
              <p className="text-sm text-gray-600 mt-6 text-center font-normal">
                {language === 'si' 
                  ? `සමස්ත පද්‍රව්‍යයෙන් ${overallPct}% සම්පූර්ණයි`
                  : `${overallPct}% of all MCQs & questions completed`}
              </p>
            </div>
          </div>
          );
          })()}

          {/* Notifications in here - slider (hidden on mobile) */}
          {(() => {
            const color = getCardColor(2);
            const count = notifications.length;
            const current = count > 0 ? Math.min(notificationSlideIndex, count - 1) : 0;
            const item = notifications[current];
            return (
          <div className={`hidden md:flex ${color.bg} rounded-2xl shadow-sm border ${color.border} p-8 flex-col h-full`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                <Bell className={`w-6 h-6 ${color.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'දැනුම්දීම් මෙහි' : 'Notifications in here'}</h3>
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
              {count === 0 ? (
                <p className="text-sm text-gray-600 font-normal py-4">{language === 'si' ? 'දැනුම්දීම් නොමැත' : 'No notifications yet'}</p>
              ) : (
                <>
                  <div className="flex-1 rounded-xl bg-white/60 border border-gray-200/80 p-4 min-h-[120px] flex flex-col">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{item?.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-3 flex-1">{item?.message}</p>
                    <span className="text-xs text-gray-500 mt-2">{item?.createdAt && formatNotificationDate(item.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNotificationSlideIndex((i) => Math.max(0, i - 1))}
                      disabled={count <= 1 || current <= 0}
                      className="rounded-lg shrink-0 border-gray-300 hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex gap-1.5 justify-center flex-wrap">
                      {notifications.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setNotificationSlideIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === current ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={language === 'si' ? `ස්ලයිඩ් ${idx + 1}` : `Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setNotificationSlideIndex((i) => Math.min(notifications.length - 1, i + 1))}
                      disabled={count <= 1 || current >= count - 1}
                      className="rounded-lg shrink-0 border-gray-300 hover:bg-gray-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setNotificationsDrawerOpen(true); setHasNewNotifications(false); }}
              className="mt-4 w-full rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
            >
              {language === 'si' ? 'සියල්ල බලන්න' : 'View all'}
            </Button>
          </div>
          );
          })()}
          
          {/* Start Quiz Card - MCQs Only */}
          {(() => {
            const color = getCardColor(3);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <BookOpen className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'විභාගය ආරම්භ කරන්න' : 'Start Quiz'}</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-1 font-normal">
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
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canTakeQuiz ? (language === 'si' ? 'MCQ විභාගය ආරම්භ කරන්න' : 'Start MCQ Quiz') : (language === 'si' ? 'සම්පූර්ණ' : 'Completed')}
              </Button>
            </div>
          </div>
          );
          })()}

          {/* Materials Card */}
          {(() => {
            const color = getCardColor(4);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <FileText className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'අධ්‍යයන ද්‍රව්‍ය' : 'Study Materials'}</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-1 font-normal">
                {language === 'si' 
                  ? 'ඔබේ ගුරුවරුන් විසින් උඩුගත කරන ලද PDF, සටහන් සහ අධ්‍යයන සම්පත් ප්‍රවේශ වන්න.'
                  : 'Access PDFs, notes, and study resources uploaded by your instructors.'}
              </p>
              <Button 
                onClick={() => navigate('/student/materials')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium transition-all"
              >
                {language === 'si' ? 'ද්‍රව්‍ය බලන්න' : 'View Materials'}
              </Button>
            </div>
          </div>
          );
          })()}

          {/* Essay Questions Card */}
          {(() => {
            const color = getCardColor(5);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <PenTool className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'රචනා ප්‍රශ්න' : 'Essay Questions'}</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-1 font-normal">
                {language === 'si' 
                  ? 'රචනා වර්ගයේ ප්‍රශ්න පුහුණු කර ඔබේ ලිවීමේ කුසලතා වැඩි දියුණු කරන්න.'
                  : 'Practice essay type questions and improve your writing skills.'}
              </p>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1 font-normal">{language === 'si' ? 'ලබා ගත හැකි ප්‍රශ්න' : 'Available Questions'}</div>
                <div className="text-3xl font-bold text-gray-900">{essays.length}</div>
              </div>
              <Button 
                onClick={() => navigate('/student/essays')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium transition-all"
              >
                {language === 'si' ? 'රචනා බලන්න' : 'View Essays'}
              </Button>
            </div>
          </div>
          );
          })()}

          {/* Summarize Card */}
          {(() => {
            const color = getCardColor(6);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <FileCheck className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'සාරාංශ' : 'Summarize'}</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-1 font-normal">
                {language === 'si' 
                  ? 'සාරාංශ අභ්‍යාස සම්පූර්ණ කර ඔබේ අවබෝධය සහ ලිවීමේ කුසලතා වැඩි දියුණු කරන්න.'
                  : 'Complete summary exercises to improve your comprehension and writing skills.'}
              </p>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1 font-normal">{language === 'si' ? 'ලබා ගත හැකි ප්‍රශ්න' : 'Available Questions'}</div>
                <div className="text-3xl font-bold text-gray-900">{summaries.length}</div>
              </div>
              <Button 
                onClick={() => navigate('/student/summarize')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium transition-all"
              >
                {language === 'si' ? 'සාරාංශ බලන්න' : 'View Summaries'}
              </Button>
            </div>
          </div>
          );
          })()}

          {/* Structured Questions Card */}
          {(() => {
            const color = getCardColor(7);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8`}>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <FileText className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'සිද්ධි මත පදනම් වූ ප්‍රශ්න' : 'Questions based on Incidents'}</h3>
              </div>
              <p className="text-gray-600 mb-6 flex-1 font-normal">
                {language === 'si' 
                  ? 'සිද්ධි විස්තර කියවා ඒවාට අදාළ MCQ ප්‍රශ්නවලට පිළිතුරු දෙන්න.'
                  : 'Read incident descriptions and answer related MCQ questions.'}
              </p>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1 font-normal">{language === 'si' ? 'ලබා ගත හැකි ප්‍රශ්න' : 'Available Questions'}</div>
                <div className="text-3xl font-bold text-gray-900">{structuredQuestions.length + structuredWritings.length}</div>
              </div>
              <Button 
                onClick={() => navigate('/student/structured-questions')}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 font-medium transition-all"
              >
                {language === 'si' ? 'ප්‍රශ්න බලන්න' : 'View Questions'}
              </Button>
            </div>
          </div>
          );
          })()}

          {/* Latest Score Card - hidden for now; set SHOW_LATEST_PERFORMANCE_CARD to true to show */}
          {SHOW_LATEST_PERFORMANCE_CARD && (() => {
            const color = getCardColor(8);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8 md:col-span-2 lg:col-span-1`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <TrendingUp className={`w-6 h-6 ${color.iconText}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'නවතම කාර්ය සාධනය' : 'Latest Performance'}</h3>
              </div>
              <div className="flex items-end gap-2 mb-4">
                <div className="text-5xl font-bold text-gray-900">
                  {userStats.score || 0}
                </div>
              </div>
              <p className="text-sm text-gray-600 font-normal">
                {language === 'si' ? 'උපයන ලද මුළු ලකුණු' : 'Total points earned'}
              </p>
            </div>
          </div>
          );
          })()}

          {/* Total Score Card */}
          {(() => {
            const color = getCardColor(9);
            return (
          <div className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-8 md:col-span-2 lg:col-span-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 ${color.iconBg} rounded-xl border ${color.iconBorder}`}>
                  <Award className={`w-8 h-8 ${color.iconText}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{language === 'si' ? 'මුළු ලකුණු' : 'Total Score'}</h3>
                  <p className="text-sm text-gray-600 font-normal">{language === 'si' ? 'ඔබේ සමුච්චිත ලකුණු' : 'Your cumulative points'}</p>
                </div>
              </div>
              <div className="text-5xl font-bold text-gray-900">
                {userStats.score || 0}
              </div>
            </div>
          </div>
          );
          })()}
        </div>

        {/* Full Width Bar */}
        <div className="mt-8 w-full bg-gray-50 rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{language === 'si' ? 'ඉගෙනීම දිගටම කරගෙන යන්න!' : 'Keep Learning!'}</h3>
              <p className="text-gray-600 font-normal">{language === 'si' ? 'ඔබේ ලකුණු සහ දැනුම වැඩි දියුණු කිරීමට පුහුණු වීම දිගටම කරගෙන යන්න' : 'Continue practicing to improve your score and knowledge'}</p>
            </div>
            <Button 
              onClick={() => navigate('/quiz')}
              disabled={!canTakeQuiz}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12 px-8 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canTakeQuiz ? (language === 'si' ? 'දැන් විභාගය ආරම්භ කරන්න' : 'Start Quiz Now') : (language === 'si' ? 'සම්පූර්ණ' : 'Completed')}
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-700" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{language === 'si' ? 'දැනුම්දීම්' : 'Notifications'}</h3>
                <p className="text-sm text-gray-600 font-normal">{language === 'si' ? 'විද්‍යුත් තැපෑල සහ WhatsApp හරහා දැනුම්දීම් ලබා ගන්න' : 'Receive notifications via email and WhatsApp'}</p>
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {dailyCompleted}
            </div>
            <div className="text-sm text-gray-600 font-normal">{language === 'si' ? 'අද සම්පූර්ණ කරන ලදී' : 'Completed Today'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {remainingToday}
            </div>
            <div className="text-sm text-gray-600 font-normal">{language === 'si' ? 'අදට ඉතිරි' : 'Remaining Today'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {dailyLimit}
            </div>
            <div className="text-sm text-gray-600 font-normal">{language === 'si' ? 'දිනපතා සීමාව' : 'Daily Limit'}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {userStats.score || 0}
            </div>
            <div className="text-sm text-gray-600 font-normal">{language === 'si' ? 'මුළු ලකුණු' : 'Total Score'}</div>
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        open={notificationsDrawerOpen}
        onClose={() => setNotificationsDrawerOpen(false)}
      />
    </div>
  );
}

