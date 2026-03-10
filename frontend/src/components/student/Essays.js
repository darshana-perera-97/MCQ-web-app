import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { essayAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ArrowLeft, PenTool, Search, Loader, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function Essays() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [essays, setEssays] = useState([]);
  const [filteredEssays, setFilteredEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEssay, setSelectedEssay] = useState(null);

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
    loadEssays();
  }, []);

  useEffect(() => {
    filterEssays();
  }, [essays, searchQuery, selectedCategory]);

  const loadEssays = async () => {
    try {
      setLoading(true);
      const response = await essayAPI.getAll();
      setEssays(response.essays || []);
    } catch (err) {
      console.error('Error loading essays:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEssays = () => {
    let filtered = essays;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.question?.toLowerCase().includes(query) ||
        e.id?.toLowerCase().includes(query) ||
        e.category?.toLowerCase().includes(query)
      );
    }

    setFilteredEssays(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = ['All', ...new Set(essays.map(e => e.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Loading essay questions...</div>
        </div>
      </div>
    );
  }

  if (selectedEssay) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <PenTool className="w-8 h-8 text-gray-700" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">{selectedEssay.id}</h1>
                <p className="text-gray-600 font-normal text-base">{language === 'si' ? 'රචනා ප්‍රශ්නය' : 'Essay Question'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setSelectedEssay(null)}
              className="gap-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === 'si' ? 'ආපසු' : 'Back to Essays'}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-6">
            {/* Essay Info */}
            <div className="flex items-center gap-4 flex-wrap">
              {selectedEssay.category && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm font-medium text-gray-700">{selectedEssay.category}</div>
                </div>
              )}
              {selectedEssay.createdAt && (
                <div className="text-sm text-gray-500 font-normal">
                  {formatDate(selectedEssay.createdAt)}
                </div>
              )}
            </div>

            {/* Essay Question Content */}
            {(() => {
              const color = getRandomColor(0);
              return (
            <div className={`${color.bg} rounded-2xl p-8 border ${color.border} shadow-sm`}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                  <FileText className={`w-5 h-5 ${color.iconText}`} />
                </div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{language === 'si' ? 'ප්‍රශ්නය' : 'Question'}</h3>
              </div>
              <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap font-normal">
                {selectedEssay.question}
              </p>
            </div>
            );
            })()}

            {/* Answer Section (if available) */}
            {selectedEssay.answer && (() => {
              const color = getRandomColor(1);
              return (
              <div className={`${color.bg} rounded-2xl p-8 border ${color.border} shadow-sm`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                    <PenTool className={`w-5 h-5 ${color.iconText}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{language === 'si' ? 'නියමුණු පිළිතුර' : 'Sample Answer'}</h3>
                </div>
                <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedEssay.answer}
                </p>
              </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <PenTool className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-900">{language === 'si' ? 'රචනා ප්‍රශ්න' : 'Essay Questions'}</h1>
              <p className="text-gray-600 font-normal text-base">{language === 'si' ? 'රචනා ප්‍රශ්න පුහුණු කර ඔබේ ලිවීමේ කුසලතා වැඩි දියුණු කරන්න' : 'Practice essay questions to improve your writing skills'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/student/dashboard')}
            className="gap-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'si' ? 'උපුටා දැක්වීම' : 'Back to Dashboard'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder={language === 'si' ? 'රචනා ප්‍රශ්න සොයන්න...' : 'Search essay questions...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-lg border-gray-200 bg-white focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:ring-offset-0"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 h-11 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 focus:outline-none bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Essays Grid */}
        {filteredEssays.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-xl mb-6 border border-gray-200">
              <PenTool className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{language === 'si' ? 'රචනා ප්‍රශ්න නොමැත' : 'No Essay Questions Available'}</h3>
            <p className="text-gray-600 font-normal text-base">
              {essays.length === 0 
                ? (language === 'si' ? 'රචනා ප්‍රශ්න තවමත් නොමැත' : 'No essay questions available yet')
                : (language === 'si' ? 'ඔබේ සෙවීමට ගැලපෙන ප්‍රශ්න නොමැත' : 'No essay questions match your search')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEssays.map((essay, index) => {
              const colors = [
                { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconBorder: 'border-purple-200', iconText: 'text-purple-700' },
                { bg: 'bg-indigo-50', border: 'border-indigo-100', iconBg: 'bg-indigo-100', iconBorder: 'border-indigo-200', iconText: 'text-indigo-700' },
                { bg: 'bg-violet-50', border: 'border-violet-100', iconBg: 'bg-violet-100', iconBorder: 'border-violet-200', iconText: 'text-violet-700' },
              ];
              const color = colors[index % colors.length];
              return (
              <div
                key={essay.id}
                onClick={() => setSelectedEssay(essay)}
                className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-6 hover:shadow-md hover:${color.border.replace('100', '200')} transition-all duration-200 cursor-pointer group`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 ${color.iconBg} rounded-lg border ${color.iconBorder} group-hover:opacity-80 transition-colors`}>
                    <PenTool className={`w-6 h-6 ${color.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{essay.id}</h3>
                    {essay.category && (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {essay.category}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3 font-normal">
                  {essay.question}
                </p>
                {essay.createdAt && (
                  <div className="text-xs text-gray-500 font-normal mb-3">
                    {formatDate(essay.createdAt)}
                  </div>
                )}
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  <span>{language === 'si' ? 'ප්‍රශ්නය බලන්න' : 'View Question'}</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
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

