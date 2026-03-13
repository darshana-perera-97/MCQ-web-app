import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { mcqAPI, userAPI } from '../../services/api';
import { Button } from '../ui/button';
import { RecaptchaWidget, useRecaptchaRequired } from '../RecaptchaWidget';
import { RecaptchaErrorBoundary } from '../RecaptchaErrorBoundary';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const EVERY_N_QUESTIONS = 10;
const QUIZ_QUESTION_OFFSET = 5; // 5th from last viewed

export function GeneralKnowledgeNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const recaptchaRef = useRef(null);
  const recaptchaRequired = useRecaptchaRequired();
  const [mcqs, setMcqs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);
  const shownMilestonesRef = useRef(new Set());

  const [showRecaptchaModal, setShowRecaptchaModal] = useState(false);
  const [showKnowledgeCheckModal, setShowKnowledgeCheckModal] = useState(false);
  const [quizMcq, setQuizMcq] = useState(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [recaptchaErrorKey, setRecaptchaErrorKey] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const [notesRes, stats] = await Promise.all([
          mcqAPI.getGeneralKnowledgeNotes(),
          userAPI.getUserStats(user.id),
        ]);
        if (!mounted) return;
        const list = notesRes.mcqs || [];
        setMcqs(list);
        const lastIndex = Math.min(
          Math.max(0, stats.generalKnowledgeLastIndex ?? 0),
          Math.max(0, list.length - 1)
        );
        setCurrentIndex(lastIndex);
        initialLoadDone.current = true;
      } catch (err) {
        console.error('Error loading general knowledge notes:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [user, navigate]);

  useEffect(() => {
    if (!user?.id || mcqs.length === 0 || !initialLoadDone.current) return;
    let cancelled = false;
    (async () => {
      try {
        await userAPI.updateGeneralKnowledgeProgress(user.id, currentIndex);
      } catch (err) {
        if (!cancelled) console.error('Failed to save progress:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [currentIndex, user?.id, mcqs.length]);

  // After every 10 questions, show reCAPTCHA then "Shall we try your knowledge?" with MCQ 5th from last
  useEffect(() => {
    if (mcqs.length === 0 || !initialLoadDone.current) return;
    const questionNumber = currentIndex + 1;
    if (questionNumber % EVERY_N_QUESTIONS !== 0) return;
    if (shownMilestonesRef.current.has(questionNumber)) return;
    shownMilestonesRef.current.add(questionNumber);
    setShowRecaptchaModal(true);
  }, [currentIndex, mcqs.length]);

  const proceedToKnowledgeCheck = () => {
    const quizIndex = Math.max(0, currentIndex - QUIZ_QUESTION_OFFSET);
    setQuizMcq(mcqs[quizIndex] || null);
    setSelectedQuizAnswer(null);
    setQuizResult(null);
    setShowKnowledgeCheckModal(true);
  };

  const handleRecaptchaContinue = (skipVerify = false) => {
    if (!skipVerify) {
      const token = recaptchaRef.current?.getValue?.() || '';
      if (recaptchaRequired && !token) {
        alert(language === 'si' ? 'කරුණාකර reCAPTCHA සම්පූර්ණ කරන්න.' : 'Please complete the reCAPTCHA.');
        return;
      }
      recaptchaRef.current?.reset?.();
    }
    setShowRecaptchaModal(false);
    // Delay before showing next modal so reCAPTCHA can clean up and avoid timeout on unmount
    setTimeout(proceedToKnowledgeCheck, 400);
  };

  const handleQuizSubmit = () => {
    if (!selectedQuizAnswer || !quizMcq) return;
    const correct = selectedQuizAnswer === quizMcq.answer;
    setQuizResult(correct ? 'correct' : 'incorrect');
  };

  const handleCloseKnowledgeCheck = () => {
    const wasIncorrect = quizResult === 'incorrect';
    setShowKnowledgeCheckModal(false);
    setQuizMcq(null);
    setSelectedQuizAnswer(null);
    setQuizResult(null);
    if (wasIncorrect) navigate('/student/dashboard');
  };

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i + 1 >= mcqs.length ? 0 : i + 1));
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">{language === 'si' ? 'පොත් ගෙන එනවා...' : 'Loading...'}</p>
      </div>
    );
  }

  const current = mcqs[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = mcqs.length > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <Button
          variant="ghost"
          className="mb-4 -ml-2 text-gray-700 hover:bg-gray-100"
          onClick={() => navigate('/student/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'si' ? 'උපකරණයට' : 'Dashboard'}
        </Button>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {language === 'si' ? 'සාමාන්‍ය දැනුම සටහන්' : 'General Knowledge Notes'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {language === 'si' ? 'ප්‍රශ්නය සහ නිවැරදි උත්තරය' : 'Question and correct answer'}
        </p>

        {/* Verify – inline on page (after every 10 questions) */}
        {showRecaptchaModal && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {language === 'si' ? 'සත්‍යාපනය' : 'Verify'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {language === 'si'
                ? 'කරුණාකර ඔබ මිනිසෙක් බව සත්‍යාපනය කරන්න.'
                : "Please verify you're human to continue."}
            </p>
            <RecaptchaErrorBoundary
              key={recaptchaErrorKey}
              onContinue={() => handleRecaptchaContinue(true)}
              onTryAgain={() => setRecaptchaErrorKey((k) => k + 1)}
            >
              <RecaptchaWidget ref={recaptchaRef} />
            </RecaptchaErrorBoundary>
            <div className="flex justify-end mt-4">
              <Button onClick={() => handleRecaptchaContinue()}>
                {language === 'si' ? 'ඉදිරියට' : 'Continue'}
              </Button>
            </div>
          </div>
        )}

        {/* Knowledge check – inline on page */}
        {showKnowledgeCheckModal && quizMcq && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {language === 'si' ? 'ඔබේ දැනුම පරීක්ෂා කරමුද?' : 'Shall we try your knowledge?'}
            </h3>
            {!quizResult && (
              <p className="text-sm text-gray-500 mb-4">
                {language === 'si' ? 'පහත ප්‍රශ්නයට උත්තරය තෝරන්න.' : 'Choose the answer for the question below.'}
              </p>
            )}
            <div className="space-y-4 py-2">
              <p className="font-medium text-gray-900 leading-relaxed">{quizMcq.question}</p>
              {!quizResult ? (
                <div className="grid gap-2">
                  {['A', 'B', 'C', 'D'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedQuizAnswer(key)}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        selectedQuizAnswer === key
                          ? 'border-[#667eea] bg-indigo-50 text-gray-900'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{key}.</span> {quizMcq[`option${key}`]}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`rounded-xl border p-4 ${quizResult === 'correct' ? 'border-green-500 bg-green-50 text-green-900' : 'border-red-500 bg-red-50 text-red-900'}`}>
                  {quizResult === 'correct' ? (
                    <span className="flex items-center gap-2 font-medium">
                      <Check className="w-5 h-5" />
                      {language === 'si' ? 'නිවැරදියි!' : 'Correct!'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 font-medium">
                      <X className="w-5 h-5" />
                      {language === 'si' ? 'වැරදියි. නිවැරදි උත්තරය:' : 'Incorrect. Correct answer:'} {quizMcq[`option${quizMcq.answer}`]}
                    </span>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                {!quizResult ? (
                  <Button onClick={handleQuizSubmit} disabled={!selectedQuizAnswer}>
                    {language === 'si' ? 'ඉදිරිපත් කරන්න' : 'Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleCloseKnowledgeCheck}>
                    {language === 'si' ? 'වසන්න' : 'Close'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {mcqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
            {language === 'si' ? 'සාමාන්‍ය දැනුම ප්‍රශ්න තවම නොමැත.' : 'No general knowledge questions yet.'}
          </div>
        ) : (showRecaptchaModal || showKnowledgeCheckModal) ? null : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                {current?.question}
              </h2>
              <div className="rounded-xl border border-green-500 bg-green-50 p-4 text-green-900">
                {current && current[`option${current.answer}`]}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="rounded-xl"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {language === 'si' ? 'කලින්' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={!hasNext}
                className="rounded-xl"
              >
                {language === 'si' ? 'ඊළඟ' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
