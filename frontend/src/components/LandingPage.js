import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { GraduationCap, BookOpen, Users, TrendingUp, ChevronLeft, ChevronRight, Bell, Sparkles, Award, Zap, CheckCircle2 } from 'lucide-react';
import { notificationAPI } from '../services/api';
import { BACKEND_URL } from '../config/api';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingPage() {
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
      }, 6000); // Auto-rotate every 6 seconds
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
          onClick={() => navigate('/sin')}
          variant="outline"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white"
        >
          සිංහල
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
                Learning Management
                <br />
                <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  System
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl sm:text-2xl lg:text-3xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Enhance your knowledge with daily quizzes, track your progress, and achieve your learning goals
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
                  Get Started
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
            <span className="text-sm font-medium text-[#667eea]">Why Choose Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive learning solution designed to help you achieve your goals
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Daily Quizzes</h3>
              <p className="text-gray-600 leading-relaxed">
                Challenge yourself with daily MCQ questions designed to enhance your knowledge and skills
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your performance with detailed analytics and track your improvement over time
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Learning</h3>
              <p className="text-gray-600 leading-relaxed">
                Join a community of learners and compete with others on the leaderboard
              </p>
            </div>
          </motion.div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, text: 'Fast & Efficient', gradient: 'from-[#667eea] to-[#764ba2]' },
            { icon: Award, text: 'Achievement System', gradient: 'from-[#00c6ff] to-[#0072ff]' },
            { icon: CheckCircle2, text: 'Verified Content', gradient: 'from-[#84fab0] to-[#8fd3f4]' },
            { icon: Sparkles, text: 'Modern Interface', gradient: 'from-[#667eea] to-[#764ba2]' },
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
              Latest
              <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent"> Announcements</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with our latest news, updates, and important information
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-gray-600">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">No announcements at the moment</p>
              <p className="text-gray-500 text-sm mt-2">Check back later for updates</p>
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
                            {new Date(currentNotification.createdAt).toLocaleDateString('en-US', {
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
                      aria-label="Previous notification"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-[#667eea] transition-colors" />
                    </button>
                    <button
                      onClick={nextNotification}
                      className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white hover:bg-gray-50 rounded-full shadow-xl flex items-center justify-center transition-all z-10 border border-gray-200 group"
                      aria-label="Next notification"
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
                      aria-label={`Go to notification ${index + 1}`}
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
                    {currentNotificationIndex + 1} of {notifications.length}
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
              { number: '1000+', label: 'Active Students', gradient: 'from-[#667eea] to-[#764ba2]' },
              { number: '500+', label: 'Questions', gradient: 'from-[#00c6ff] to-[#0072ff]' },
              { number: '95%', label: 'Success Rate', gradient: 'from-[#84fab0] to-[#8fd3f4]' },
              { number: '24/7', label: 'Available', gradient: 'from-[#667eea] to-[#764ba2]' },
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
              Ready to Start Learning?
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are already improving their skills and achieving their goals
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/login')}
                className="h-14 px-10 rounded-2xl bg-white text-[#667eea] hover:bg-white/95 font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Now
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
              © {new Date().getFullYear()} Learning Management System. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Built with React • Tailwind CSS • Node.js
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

