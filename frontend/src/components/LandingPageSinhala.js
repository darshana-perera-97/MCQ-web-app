import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  UserPlus,
  CreditCard,
  CheckCircle,
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import { BACKEND_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingPageSinhala() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentNotificationIndex((prev) => (prev + 1) % notifications.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextNotification = () => {
    setCurrentNotificationIndex((prev) => (prev + 1) % notifications.length);
  };

  const prevNotification = () => {
    setCurrentNotificationIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
  };

  const goToNotification = (index) => {
    setCurrentNotificationIndex(index);
  };

  const currentNotification = notifications[currentNotificationIndex];

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
        >
          English
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mb-8 shadow-2xl border border-white/30"
              >
                <GraduationCap className="w-12 h-12 text-white" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                අධ්‍යාපන කළමණාකරණ
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  පද්ධතිය
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                දිනපතා ප්‍රශ්න සමඟ ඔබේ දැනුම වැඩිදියුණු කරන්න, ඔබේ ප්‍රගතිය ලුහුබැඳ බලන්න, සහ ඔබේ ඉගෙනීමේ අරමුණු සාක්ෂාත් කරගන්න
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/80 mb-10 max-w-3xl mx-auto"
              >
                ශ්‍රී ලංකා රජයේ විභාග සඳහා සූදානම් වන ශිෂ්‍යයන් සඳහා
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex justify-center"
              >
                <Button
                  onClick={() => navigate('/login')}
                  className="h-14 px-10 rounded-2xl bg-white text-[#667eea] hover:bg-white/95 font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  ආරම්භ කරන්න
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2"
          >
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
          </motion.div>
        </div>
      </div>

      {/* How to Get Started in 3 Simple Steps (Sinhala) */}
      <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm text-xs sm:text-sm font-medium text-[#667eea] border border-[#667eea]/10 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              ක්‍රියාවලිය මෙසේය
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              සරල අදියර 3කින් ආරම්භ කරන්නේ කෙසේද
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              ඔබේ ගිණුම සාදා, ගෙවීම සම්පූර්ණ කර, සම්පූර්ණ ප්‍රවේශය ලබා ගැනීමට අදියර 3ක මෙම මාර්ගෝපදේශය අනුගමනය කරන්න.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute inset-y-6 left-1/2 w-px bg-gradient-to-b from-[#667eea]/0 via-[#667eea]/15 to-[#667eea]/0 pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative bg-violet-50/80 rounded-2xl p-6 sm:p-7 shadow-sm border border-violet-100 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-violet-500" />
              <div className="inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full bg-[#667eea] text-white text-xs font-semibold shadow-md mb-4">
                1 වන අදියර
              </div>
              <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-[#667eea]/10 text-[#667eea]">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                ලියාපදිංචි වන්න
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                අප වේදිකාවේ ගිණුම සාදන්න.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#667eea] font-semibold hover:underline focus:outline-none"
                >
                  ගිණුම සාදන්න (මෙතැනින්)
                </button>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative bg-emerald-50/80 rounded-2xl p-6 sm:p-7 shadow-sm border border-emerald-100 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-emerald-500" />
              <div className="inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full bg-[#667eea] text-white text-xs font-semibold shadow-md mb-4">
                2 වන අදියර
              </div>
              <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                සක්‍රිය කරන්න
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
                අප බැංකු ගිණුමට එක් වර ගෙවීමක් සම්පූර්ණ කරන්න.
              </p>
              <div className="text-xs sm:text-sm text-gray-700 bg-white/70 rounded-xl p-3 space-y-2 border border-emerald-100">
                <p className="font-medium text-gray-800">බැංකු විස්තර:</p>
                <p className="whitespace-pre-line">
                  ගිණුමේ නම: W.S.A.D.S.Perera,{'\n'}
                  ගිණුම් අංකය: 88395576,{'\n'}
                  බැංකුව: BOC,{'\n'}
                  ශාඛාව: Chilaw
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative bg-orange-50/80 rounded-2xl p-6 sm:p-7 shadow-sm border border-orange-100 flex flex-col overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-orange-500" />
              <div className="inline-flex items-center justify-center w-fit px-3 py-1.5 rounded-full bg-[#667eea] text-white text-xs font-semibold shadow-md mb-4">
                3 වන අදියර
              </div>
              <div className="mb-3 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                ප්‍රවේශය ලබා ගන්න
              </h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                ඔබේ ගෙවීම් තහවුරුකිරීම WhatsApp{' '}
                <a href="https://wa.me/94710545132" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">+94 71 054 5132</a>
                {' '}හෝ විද්‍යුත් තැපෑල{' '}
                <a href="mailto:exam-admin@nexgenai.asia" className="text-[#667eea] font-semibold hover:underline">exam-admin@nexgenai.asia</a>ට යවන්න.
                පරිපාලකයා විසින් සත්‍යාපනය කළ පසු ඔබේ ගිණුම සම්පූර්ණයෙන් සක්‍රිය වේ!
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#667eea]" />
            <span className="text-sm font-medium text-[#667eea]">අපව තෝරාගන්නේ ඇයි</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            ඔබට අවශ්‍ය සියල්ල
            <br />
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              සාර්ථක වීමට
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ඔබේ අරමුණු සාක්ෂාත් කරගැනීමට නිර්මාණය කරන ලද සවිස්තරාත්මක ඉගෙනීමේ විසඳුමක්
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#667eea]/5 to-[#764ba2]/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">දිනපතා ප්‍රශ්න</h3>
              <p className="text-gray-600 leading-relaxed">
                ඔබේ දැනුම සහ කුසලතා වැඩිදියුණු කිරීමට නිර්මාණය කරන ලද දිනපතා MCQ ප්‍රශ්න සමඟ ඔබවම අභියෝග කරන්න
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00c6ff]/5 to-[#0072ff]/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#00c6ff] to-[#0072ff] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ප්‍රගතිය ලුහුබැඳ බලන්න</h3>
              <p className="text-gray-600 leading-relaxed">
                සවිස්තරාත්මක විශ්ලේෂණ සමඟ ඔබේ කාර්ය සාධනය නිරීක්ෂණය කර කාලයත් සමඟ ඔබේ දියුණුව ලුහුබැඳ බලන්න
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative bg-white rounded-3xl p-8 lg:p-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#84fab0]/5 to-[#8fd3f4]/5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#84fab0] to-[#8fd3f4] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">සමාජ ඉගෙනීම</h3>
              <p className="text-gray-600 leading-relaxed">
                ඉගෙනුම්කරුවන්ගේ ප්‍රජාවකට සම්බන්ධ වී අනෙකුත් අය සමඟ නායකත්ව වගුවේ තරඟ කරන්න
              </p>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, text: 'වේගවත් සහ කාර්යක්ෂම', gradient: 'from-[#667eea] to-[#764ba2]' },
            { icon: Award, text: 'ජයග්‍රහණ පද්ධතිය', gradient: 'from-[#00c6ff] to-[#0072ff]' },
            { icon: CheckCircle2, text: 'සත්‍යාපනය කරන ලද අන්තර්ගතය', gradient: 'from-[#84fab0] to-[#8fd3f4]' },
            { icon: Sparkles, text: 'නවීන අතුරුමුහුණත', gradient: 'from-[#667eea] to-[#764ba2]' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900">{feature.text}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Notifications Carousel Section */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl mb-6 shadow-lg">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              නවතම
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent"> නිවේදන</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              අපගේ නවතම ප්‍රවෘත්ති, යාවත්කාලීන කිරීම් සහ වැදගත් තොරතුරු සමඟ යාවත්කාලීනව තබාගන්න
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-gray-600">නිවේදන පූරණය වෙමින්...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">මේ මොහොතේ නිවේදන නැත</p>
              <p className="text-gray-500 text-sm mt-2">යාවත්කාලීන කිරීම් සඳහා පසුව පරීක්ෂා කරන්න</p>
            </div>
          ) : (
            <div className="relative max-w-5xl mx-auto">
              {/* Carousel Container */}
              <div className="relative overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentNotificationIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="p-8 sm:p-12 lg:p-16"
                  >
                    {currentNotification.imagePath && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8 rounded-2xl overflow-hidden shadow-lg"
                      >
                        <img
                          src={`${BACKEND_URL}${currentNotification.imagePath}`}
                          alt={currentNotification.title}
                          className="w-full h-auto max-h-[500px] object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    )}
                    
                    <div className="space-y-4">
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl font-bold text-gray-900"
                      >
                        {currentNotification.title}
                      </motion.h3>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg sm:text-xl text-gray-600 leading-relaxed whitespace-pre-line"
                      >
                        {currentNotification.message}
                      </motion.p>
                      
                      {currentNotification.createdAt && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center gap-2 pt-4 border-t border-gray-200"
                        >
                          <div className="w-2 h-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full"></div>
                          <p className="text-sm font-medium text-gray-500">
                            {new Date(currentNotification.createdAt).toLocaleDateString('si-LK', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {notifications.length > 1 && (
                  <>
                    <button
                      onClick={prevNotification}
                      className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-xl flex items-center justify-center transition-all z-10 border border-gray-200 group"
                      aria-label="පෙර නිවේදනය"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-[#667eea] transition-colors" />
                    </button>
                    <button
                      onClick={nextNotification}
                      className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-xl flex items-center justify-center transition-all z-10 border border-gray-200 group"
                      aria-label="ඊළඟ නිවේදනය"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-[#667eea] transition-colors" />
                    </button>
                  </>
                )}
              </div>

              {/* Enhanced Dots Indicator */}
              {notifications.length > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  {notifications.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToNotification(index)}
                      className={`relative rounded-full transition-all duration-300 ${
                        index === currentNotificationIndex
                          ? 'w-10 h-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] shadow-lg'
                          : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`නිවේදනය ${index + 1} වෙත යන්න`}
                    >
                      {index === currentNotificationIndex && (
                        <motion.div
                          layoutId="activeDot"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Notification Counter */}
              {notifications.length > 1 && (
                <div className="text-center mt-6">
                  <span className="text-sm font-medium text-gray-500">
                    {currentNotificationIndex + 1} / {notifications.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {[
              { number: '1000+', label: 'සක්‍රීය ශිෂ්‍යයන්', gradient: 'from-[#667eea] to-[#764ba2]' },
              { number: '500+', label: 'ප්‍රශ්න', gradient: 'from-[#00c6ff] to-[#0072ff]' },
              { number: '95%', label: 'සාර්ථකතා අනුපාතය', gradient: 'from-[#84fab0] to-[#8fd3f4]' },
              { number: '24/7', label: 'ලබා ගත හැකිය', gradient: 'from-[#667eea] to-[#764ba2]' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.number}
                </div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#667eea] py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              ඉගෙනීම ආරම්භ කිරීමට සූදානම්ද?
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              දැනටමත් ඔවුන්ගේ කුසලතා වැඩිදියුණු කර ඔවුන්ගේ අරමුණු සාක්ෂාත් කරගන්නා දහස් ගණනක් ශිෂ්‍යයන්ට සම්බන්ධ වන්න
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="h-14 px-10 rounded-2xl bg-white text-[#667eea] hover:bg-white/95 font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                දැන් ආරම්භ කරන්න
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-2xl mb-6 shadow-lg">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <p className="text-sm mb-2">
              © {new Date().getFullYear()} අධ්‍යාපන කළමණාකරණ පද්ධතිය. සියලුම හිමිකම් ඇවිරිණි.
            </p>
            <p className="text-xs text-gray-500">
              ශ්‍රී ලංකා රජයේ විභාග සඳහා සූදානම් වන ශිෂ්‍යයන් සඳහා
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

