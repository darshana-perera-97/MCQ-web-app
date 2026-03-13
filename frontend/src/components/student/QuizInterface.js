import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mcqAPI, userAPI } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { ArrowLeft, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuizInterface() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [questionsCompleted, setQuestionsCompleted] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [showLimitReachedPopup, setShowLimitReachedPopup] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadUserStats();
    loadNewQuestion();
  }, [user, navigate]);

  const loadUserStats = async () => {
    try {
      const stats = await userAPI.getUserStats(user.id);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadNewQuestion = async () => {
    try {
      setLoading(true);
      const question = await mcqAPI.getRandom(user.id);
      if (!question) {
        setShowLimitReachedPopup(true);
        return;
      }
      setCurrentQuestion(question);
      setSelectedAnswer(null);
      setShowResult(false);
      setCorrectAnswer(null);
    } catch (error) {
      console.error('Error loading question:', error);
      if (error.message.includes('Daily limit reached')) {
        setShowLimitReachedPopup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || !currentQuestion || !user) return;
    
    try {
      const response = await mcqAPI.submitAnswer(user.id, currentQuestion.id, selectedAnswer);
      setIsCorrect(response.correct);
      setCorrectAnswer(response.correctAnswer);
      setShowResult(true);
      setQuestionsCompleted(prev => prev + 1);
      if (response.correct) setCorrectCount(prev => prev + 1);
      
      // Update user stats
      await loadUserStats();
      
      // Update user in context if score changed
      if (response.pointsEarned > 0) {
        const updatedStats = await userAPI.getUserStats(user.id);
        updateUser({ ...user, score: updatedStats.score });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(error.message || 'Failed to submit answer');
    }
  };

  const handleNext = async () => {
    const stats = await userAPI.getUserStats(user.id);
    setUserStats(stats);
    if (stats.dailyCount >= stats.dailyLimit) {
      setShowLimitReachedPopup(true);
      return;
    }
    loadNewQuestion();
  };

  const handleCloseLimitReachedPopup = () => {
    setShowLimitReachedPopup(false);
    navigate('/student/dashboard');
  };

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading question...</div>
        </div>
      </div>
    );
  }

  const options = [
    { label: 'A', text: currentQuestion.optionA },
    { label: 'B', text: currentQuestion.optionB },
    { label: 'C', text: currentQuestion.optionC },
    { label: 'D', text: currentQuestion.optionD },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/dashboard')}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="text-sm font-medium text-gray-500">
            Question {questionsCompleted + 1}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Question ID */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10 rounded-xl">
            <div className="text-sm font-medium text-gray-600">ID:</div>
            <div className="text-sm font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {currentQuestion.id}
            </div>
          </div>
          {currentQuestion.category && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl ml-3">
              <div className="text-sm font-medium text-gray-600">{currentQuestion.category}</div>
            </div>
          )}
        </div>

        {/* Question Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 leading-relaxed mb-4">
            {currentQuestion.question}
          </h2>
          {currentQuestion.image && (
            <div className="mt-6 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              <img
                src={`${BACKEND_URL}${currentQuestion.image}`}
                alt="Question"
                className="w-full h-auto max-h-96 object-contain bg-gray-50"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </motion.div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option.label;
            const isCorrectAnswer = showResult && correctAnswer === option.label;
            const showCorrect = showResult && isCorrect && isSelected;
            const showIncorrect = showResult && isSelected && !isCorrect;
            const showCorrectAnswer = showResult && !isCorrect && isCorrectAnswer;

            let borderClass = 'border-gray-200';
            let bgClass = 'bg-white hover:bg-gray-50';
            let iconElement = null;

            if (isSelected && !showResult) {
              borderClass = 'border-transparent';
              bgClass = 'bg-gradient-to-r from-[#667eea] to-[#764ba2]';
            }

            if (showCorrect) {
              borderClass = 'border-green-500';
              bgClass = 'bg-green-50';
              iconElement = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto p-2 bg-green-500 rounded-full"
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              );
            }

            if (showIncorrect) {
              borderClass = 'border-red-500';
              bgClass = 'bg-red-50';
              iconElement = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto p-2 bg-red-500 rounded-full"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.div>
              );
            }

            if (showCorrectAnswer) {
              borderClass = 'border-green-500';
              bgClass = 'bg-green-50';
              iconElement = (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto flex items-center gap-2"
                >
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg">
                    Correct Answer
                  </span>
                  <div className="p-2 bg-green-500 rounded-full">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.button
                key={option.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswerSelect(option.label)}
                disabled={showResult}
                className={`w-full p-6 rounded-2xl border-2 ${borderClass} ${bgClass} transition-all duration-200 flex items-center gap-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] disabled:cursor-not-allowed`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-semibold text-lg ${
                  isSelected && !showResult
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : showCorrectAnswer
                    ? 'bg-green-500 text-white'
                    : showIncorrect
                    ? 'bg-red-500 text-white'
                    : showCorrect
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {option.label}
                </div>
                <div className={`flex-1 font-medium ${
                  isSelected && !showResult ? 'text-white' : 
                  showCorrectAnswer || showCorrect ? 'text-green-900' :
                  showIncorrect ? 'text-red-900' : 'text-gray-900'
                }`}>
                  {option.text}
                </div>
                {iconElement}
              </motion.button>
            );
          })}
        </div>

        {/* Submit/Next Button */}
        {!showResult && selectedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={handleSubmit}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white font-medium text-lg shadow-[0_4px_24px_rgba(102,126,234,0.3)]"
            >
              Submit Answer
            </Button>
          </motion.div>
        )}

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Result Message */}
            <div className={`p-6 rounded-2xl ${
              isCorrect 
                ? 'bg-green-50 border-2 border-green-200' 
                : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {isCorrect ? (
                  <div className="p-3 bg-green-500 rounded-full">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-500 rounded-full">
                    <X className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <div className={`text-lg font-semibold ${
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </div>
                  <div className={`text-sm ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isCorrect 
                      ? '+10 points added to your score' 
                      : `The correct answer is ${correctAnswer}. Better luck next time!`
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:opacity-90 text-white font-medium text-lg shadow-[0_4px_24px_rgba(0,114,255,0.3)]"
            >
              {userStats && userStats.dailyCount >= userStats.dailyLimit 
                ? 'Back to Dashboard' 
                : 'Next Question'
              }
            </Button>
          </motion.div>
        )}
      </div>

      {/* Daily limit reached – show correct answers count */}
      <Dialog open={showLimitReachedPopup} onOpenChange={(open) => !open && handleCloseLimitReachedPopup()}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Daily limit reached</DialogTitle>
            <DialogDescription>
              Number of correct answers given by you: <strong className="text-gray-900">{correctCount}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button onClick={handleCloseLimitReachedPopup}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

