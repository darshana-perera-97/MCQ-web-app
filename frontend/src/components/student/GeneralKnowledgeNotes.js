import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { mcqAPI, userAPI } from '../../services/api';
import { Button } from '../ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

export function GeneralKnowledgeNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [mcqs, setMcqs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

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

  const handlePrev = () => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => Math.min(mcqs.length - 1, i + 1));
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
  const hasNext = currentIndex < mcqs.length - 1;

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

        {mcqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-600">
            {language === 'si' ? 'සාමාන්‍ය දැනුම ප්‍රශ්න තවම නොමැත.' : 'No general knowledge questions yet.'}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <BookOpen className="w-4 h-4" />
                <span>
                  {currentIndex + 1} / {mcqs.length}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                {current?.question}
              </h2>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((key) => (
                  <div
                    key={key}
                    className={`rounded-xl border p-3 ${
                      current?.answer === key
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="font-medium">{key}.</span>{' '}
                    {current?.[`option${key}`]}
                    {current?.answer === key && (
                      <span className="ml-2 text-sm font-semibold text-green-700">
                        ({language === 'si' ? 'නිවැරදි' : 'Correct'})
                      </span>
                    )}
                  </div>
                ))}
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
              <span className="text-sm text-gray-500">
                {currentIndex + 1} / {mcqs.length}
              </span>
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
