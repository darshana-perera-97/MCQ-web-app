import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { structuredQuestionAPI, structuredWritingAPI, userAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft, Search, Loader, FileText, CheckCircle2, Circle, Eye, PenLine, Check, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function StructuredQuestions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [questions, setQuestions] = useState([]);
  const [writings, setWritings] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [filteredWritings, setFilteredWritings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'mcq' | 'writing'
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { mcqId: 'A' | 'B' | 'C' | 'D' }
  const [revealedAnswers, setRevealedAnswers] = useState({}); // { qaIndex: true } for writing view
  const [completedQuestionIds, setCompletedQuestionIds] = useState([]);
  const [completedWritingIds, setCompletedWritingIds] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  // One-by-one MCQ flow: current index and whether current question was submitted (show answer + Next)
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [submittedMcqIndex, setSubmittedMcqIndex] = useState(null);

  // Random light color palette
  const getRandomColor = (index) => {
    const colors = [
      { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconBorder: 'border-blue-200', iconText: 'text-blue-700' },
      { bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100', iconBorder: 'border-green-200', iconText: 'text-green-700' },
      { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconBorder: 'border-purple-200', iconText: 'text-purple-700' },
      { bg: 'bg-pink-50', border: 'border-pink-100', iconBg: 'bg-pink-100', iconBorder: 'border-pink-200', iconText: 'text-pink-700' },
      { bg: 'bg-indigo-50', border: 'border-indigo-100', iconBg: 'bg-indigo-100', iconBorder: 'border-indigo-200', iconText: 'text-indigo-700' },
      { bg: 'bg-yellow-50', border: 'border-yellow-100', iconBg: 'bg-yellow-100', iconBorder: 'border-yellow-200', iconText: 'text-yellow-700' },
      { bg: 'bg-cyan-50', border: 'border-cyan-100', iconBg: 'bg-cyan-100', iconBorder: 'border-cyan-200', iconText: 'text-cyan-700' },
      { bg: 'bg-orange-50', border: 'border-orange-100', iconBg: 'bg-orange-100', iconBorder: 'border-orange-200', iconText: 'text-orange-700' },
      { bg: 'bg-teal-50', border: 'border-teal-100', iconBg: 'bg-teal-100', iconBorder: 'border-teal-200', iconText: 'text-teal-700' },
      { bg: 'bg-rose-50', border: 'border-rose-100', iconBg: 'bg-rose-100', iconBorder: 'border-rose-200', iconText: 'text-rose-700' },
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [qRes, wRes] = await Promise.all([
          structuredQuestionAPI.getAll(),
          structuredWritingAPI.getAll(),
        ]);
        setQuestions(qRes.structuredQuestions || []);
        setWritings(wRes.structuredWritings || []);
      } catch (err) {
        console.error('Error loading:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    if (user?.id) loadCompletions();
  }, [user?.id]);

  useEffect(() => {
    filterQuestions();
    filterWritings();
  }, [questions, writings, searchQuery, selectedCategory]);

  const loadCompletions = async () => {
    if (!user?.id) return;
    try {
      const data = await userAPI.getCompletions(user.id);
      setCompletedQuestionIds(data.completedStructuredQuestionIds || []);
      setCompletedWritingIds(data.completedStructuredWritingIds || []);
    } catch (err) {
      console.error('Error loading completions:', err);
    }
  };

  const handleToggleComplete = async (e, type, itemId) => {
    e.stopPropagation();
    if (!user?.id || togglingId) return;
    setTogglingId(itemId);
    try {
      const res = await userAPI.toggleComplete(user.id, { type, itemId });
      setCompletedQuestionIds(res.completions?.completedStructuredQuestionIds || []);
      setCompletedWritingIds(res.completions?.completedStructuredWritingIds || []);
    } catch (err) {
      console.error('Error toggling completion:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;
    if (selectedCategory !== 'All') filtered = filtered.filter(q => q.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q =>
        q.title?.toLowerCase().includes(query) ||
        q.id?.toLowerCase().includes(query) ||
        q.paragraph?.toLowerCase().includes(query) ||
        q.category?.toLowerCase().includes(query)
      );
    }
    setFilteredQuestions(filtered);
  };

  const filterWritings = () => {
    let filtered = writings;
    if (selectedCategory !== 'All') filtered = filtered.filter(w => w.category === selectedCategory);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(w =>
        w.title?.toLowerCase().includes(query) ||
        w.id?.toLowerCase().includes(query) ||
        w.paragraph?.toLowerCase().includes(query) ||
        w.category?.toLowerCase().includes(query)
      );
    }
    setFilteredWritings(filtered);
  };

  const handleAnswerSelect = (mcqId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqId]: answer
    }));
  };

  const handleBackToList = () => {
    setSelectedQuestion(null);
    setSelectedType(null);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setCurrentMcqIndex(0);
    setSubmittedMcqIndex(null);
  };

  // Reset one-by-one MCQ state when opening a different question set
  useEffect(() => {
    if (selectedQuestion && selectedType === 'mcq') {
      setCurrentMcqIndex(0);
      setSubmittedMcqIndex(null);
    }
  }, [selectedQuestion?.id, selectedType]);

  const toggleRevealAnswer = (index) => {
    setRevealedAnswers(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Loading questions...</div>
        </div>
      </div>
    );
  }

  // Detail view: Writing type (paragraph left, Q&A right with View answer)
  if (selectedQuestion && selectedType === 'writing') {
    const colorScheme = getRandomColor(1);
    const sortedQa = [...(selectedQuestion.qaPairs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={handleBackToList} variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {language === 'si' ? 'ආපසු' : 'Back to Questions'}
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{selectedQuestion.title || selectedQuestion.id}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left - Paragraph */}
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)]">
              <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-2xl p-6 shadow-sm h-full overflow-y-auto`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${colorScheme.iconBg} ${colorScheme.iconBorder} border rounded-lg p-2`}>
                    <FileText className={`w-5 h-5 ${colorScheme.iconText}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{language === 'si' ? 'කරුණු' : 'Paragraph'}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedQuestion.paragraph}</p>
              </div>
            </div>

            {/* Right - Questions & View Answer */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{language === 'si' ? 'ප්‍රශ්න' : 'Questions'}</h2>
                <div className="space-y-6">
                  {sortedQa.map((qa, index) => {
                    const isRevealed = revealedAnswers[index];
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-semibold">
                            {index + 1}
                          </div>
                          <p className="text-base font-medium text-gray-900 flex-1">{qa.question}</p>
                        </div>
                        {!isRevealed ? (
                          <Button
                            type="button"
                            onClick={() => toggleRevealAnswer(index)}
                            variant="outline"
                            className="ml-11 rounded-lg gap-2 border-gray-300 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                            {language === 'si' ? 'පිළිතුරු බලන්න' : 'View answer'}
                          </Button>
                        ) : (
                          <div className="ml-11 p-4 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-sm font-medium text-green-800 mb-1">{language === 'si' ? 'පිළිතුර' : 'Answer'}</p>
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{qa.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail view: MCQ type — one question at a time, Submit then show answer, then Next question
  if (selectedQuestion && selectedType === 'mcq') {
    const colorScheme = getRandomColor(0);
    const sortedMcqs = [...(selectedQuestion.mcqs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const totalMcqs = sortedMcqs.length;
    const isFinished = totalMcqs === 0 || currentMcqIndex >= totalMcqs;
    const currentMcq = sortedMcqs[currentMcqIndex];
    const mcqId = currentMcq ? (currentMcq.id || `mcq-${currentMcqIndex}`) : null;
    const selectedAnswer = mcqId ? selectedAnswers[mcqId] : null;
    const isSubmitted = submittedMcqIndex === currentMcqIndex;
    const correctAnswer = currentMcq ? (currentMcq.answer || 'A').toUpperCase().replace(/[^ABCD]/g, 'A') : null;
    const isCorrect = isSubmitted && selectedAnswer === correctAnswer;

    const handleSubmitCurrent = () => {
      if (selectedAnswer == null || submittedMcqIndex !== null) return;
      setSubmittedMcqIndex(currentMcqIndex);
    };

    const handleNextMcq = () => {
      if (currentMcqIndex + 1 < totalMcqs) {
        setCurrentMcqIndex((i) => i + 1);
        setSubmittedMcqIndex(null);
      } else {
        setCurrentMcqIndex(totalMcqs);
      }
    };

    // All done — show completion and back button
    if (isFinished) {
      return (
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{language === 'si' ? 'සියල්ල සම්පූර්ණයි' : 'All done!'}</h2>
              <p className="text-gray-600 mb-6">{language === 'si' ? 'ඔබ මෙම ප්‍රශ්න සියල්ල සම්පූර්ණ කළා.' : 'You have completed all questions in this set.'}</p>
              <Button onClick={handleBackToList} className="rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" />
                {language === 'si' ? 'ආපසු ප්‍රශ්න ලැයිස්තුවට' : 'Back to Questions'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={handleBackToList} variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {language === 'si' ? 'ආපසු' : 'Back to Questions'}
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">{selectedQuestion.title || selectedQuestion.id}</h1>
              </div>
              <div className="text-sm font-medium text-gray-500">
                {language === 'si' ? `ප්‍රශ්න ${currentMcqIndex + 1} / ${totalMcqs}` : `Question ${currentMcqIndex + 1} of ${totalMcqs}`}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-8rem)]">
              <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-2xl p-6 shadow-sm h-full overflow-y-auto`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`${colorScheme.iconBg} ${colorScheme.iconBorder} border rounded-lg p-2`}>
                    <FileText className={`w-5 h-5 ${colorScheme.iconText}`} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{language === 'si' ? 'කරුණු' : 'Paragraph'}</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedQuestion.paragraph}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-semibold">{currentMcqIndex + 1}</div>
                    <p className="text-base font-medium text-gray-900 flex-1">{currentMcq.question}</p>
                  </div>
                  <div className="space-y-2 ml-11">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const optionText = currentMcq[`option${option}`];
                      const isSelected = selectedAnswer === option;
                      const isCorrectOpt = correctAnswer === option;
                      const showCorrect = isSubmitted && isCorrectOpt;
                      const showIncorrect = isSubmitted && isSelected && !isCorrect;
                      return (
                        <button
                          key={option}
                          onClick={() => !isSubmitted && handleAnswerSelect(mcqId, option)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            showCorrect ? 'border-green-500 bg-green-50' :
                            showIncorrect ? 'border-red-500 bg-red-50' :
                            isSelected ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-white hover:border-gray-300'
                          } ${isSubmitted ? 'cursor-default' : ''}`}
                        >
                          {showCorrect && <Check className="w-5 h-5 text-green-600 flex-shrink-0" />}
                          {showIncorrect && !showCorrect && <X className="w-5 h-5 text-red-600 flex-shrink-0" />}
                          {!isSubmitted && (isSelected ? <CheckCircle2 className="w-5 h-5 text-gray-900 flex-shrink-0" /> : <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />)}
                          <span className="font-medium text-gray-700 mr-2">{option}.</span>
                          <span className="text-gray-700">{optionText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {!isSubmitted && selectedAnswer && (
                  <Button
                    onClick={handleSubmitCurrent}
                    className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white font-medium"
                  >
                    {language === 'si' ? 'ඉදිරිපත් කරන්න' : 'Submit'}
                  </Button>
                )}

                {isSubmitted && (
                  <div className="mt-6 space-y-4">
                    <div className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                        <div className="text-left">
                          <p className={`font-semibold ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                            {isCorrect ? (language === 'si' ? 'නිවැරදියි!' : 'Correct!') : (language === 'si' ? 'වැරදියි' : 'Incorrect')}
                          </p>
                          {!isCorrect && correctAnswer && (
                            <p className="text-sm text-gray-700 mt-1">
                              {language === 'si' ? 'නිවැරදි පිළිතුර:' : 'Correct answer:'} <strong>{correctAnswer}. {currentMcq[`option${correctAnswer}`]}</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleNextMcq}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:opacity-90 text-white font-medium gap-2"
                    >
                      {currentMcqIndex + 1 < totalMcqs
                        ? (language === 'si' ? 'ඊළඟ ප්‍රශ්නය' : 'Next question')
                        : (language === 'si' ? 'අවසන් කරන්න' : 'Finish')
                      }
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  const categories = ['All', ...new Set([...questions.map(q => q.category), ...writings.map(w => w.category)].filter(Boolean))];
  const hasItems = filteredQuestions.length > 0 || filteredWritings.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'si' ? 'සිද්ධි මත පදනම් වූ ප්‍රශ්න' : 'Questions based on Incidents'}
            </h1>
            <Button onClick={() => navigate('/student/dashboard')} variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {language === 'si' ? 'ආපසු' : 'Back to Dashboard'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={language === 'si' ? 'සොයන්න...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-gray-200"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 h-12 rounded-xl border border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {!hasItems ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{language === 'si' ? 'ප්‍රශ්න නැත' : 'No Questions'}</h3>
            <p className="text-gray-600">{language === 'si' ? 'ප්‍රශ්න නොමැත' : 'No structured questions available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question, index) => {
              const colorScheme = getRandomColor(index);
              const isCompleted = completedQuestionIds.includes(question.id);
              return (
                <div
                  key={`mcq-${question.id}`}
                  onClick={() => { setSelectedQuestion(question); setSelectedType('mcq'); }}
                  className={`${colorScheme.bg} ${colorScheme.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${colorScheme.iconBg} ${colorScheme.iconBorder} border rounded-lg p-3 flex-shrink-0`}>
                      <FileText className={`w-6 h-6 ${colorScheme.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{question.title || question.id}</h3>
                      {question.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-white rounded">{question.category}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{question.paragraph}</p>
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleComplete(e, 'structuredQuestion', question.id)}
                      disabled={togglingId === question.id}
                      className={`mb-3 w-full rounded-lg font-medium ${
                        isCompleted ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
                      {isCompleted ? (language === 'si' ? 'සම්පූර්ණයි' : 'Completed') : (language === 'si' ? 'සම්පූර්ණ කරන්න' : 'Mark complete')}
                    </Button>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{question.mcqs?.length || 0} {language === 'si' ? 'MCQ' : 'MCQs'}</span>
                    <span className="font-medium text-gray-700">{language === 'si' ? 'විවෘත කරන්න' : 'View →'}</span>
                  </div>
                </div>
              );
            })}
            {filteredWritings.map((writing, index) => {
              const colorScheme = getRandomColor(filteredQuestions.length + index);
              const isCompleted = completedWritingIds.includes(writing.id);
              return (
                <div
                  key={`write-${writing.id}`}
                  onClick={() => { setSelectedQuestion(writing); setSelectedType('writing'); }}
                  className={`${colorScheme.bg} ${colorScheme.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`${colorScheme.iconBg} ${colorScheme.iconBorder} border rounded-lg p-3 flex-shrink-0`}>
                      <PenLine className={`w-6 h-6 ${colorScheme.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{writing.title || writing.id}</h3>
                      {writing.category && (
                        <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-white rounded">{writing.category}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{writing.paragraph}</p>
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleComplete(e, 'structuredWriting', writing.id)}
                      disabled={togglingId === writing.id}
                      className={`mb-3 w-full rounded-lg font-medium ${
                        isCompleted ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
                      {isCompleted ? (language === 'si' ? 'සම්පූර්ණයි' : 'Completed') : (language === 'si' ? 'සම්පූර්ණ කරන්න' : 'Mark complete')}
                    </Button>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{writing.qaPairs?.length || 0} {language === 'si' ? 'ප්‍රශ්න' : 'Q&A'}</span>
                    <span className="font-medium text-gray-700">{language === 'si' ? 'විවෘත කරන්න' : 'View →'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

