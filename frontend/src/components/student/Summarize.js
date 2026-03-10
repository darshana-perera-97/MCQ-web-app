import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { summaryAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, FileText, Loader, BookOpen, CheckCircle2, Sparkles } from 'lucide-react';

export function Summarize() {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      setLoading(true);
      const response = await summaryAPI.getAll();
      setSummaries(response.summaries || []);
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSummary = (summary) => {
    setSelectedSummary(summary);
    // Initialize form data with empty values for each input
    const initialData = {};
    summary.textInputs.forEach((input) => {
      initialData[input.id] = '';
    });
    setFormData(initialData);
  };

  const handleInputChange = (inputId, value) => {
    setFormData((prev) => ({
      ...prev,
      [inputId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSummary) return;

    setSubmitting(true);
    try {
      // Here you could save the student's responses if needed
      // For now, we'll just show a success message
      alert('Your summary has been submitted successfully!');
      setSelectedSummary(null);
      setFormData({});
    } catch (error) {
      console.error('Error submitting summary:', error);
      alert('Failed to submit summary. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-[#667eea] mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">Loading summaries...</div>
        </div>
      </div>
    );
  }

  if (selectedSummary) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <BookOpen className="w-8 h-8 text-gray-700" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold tracking-tight mb-2 text-gray-900">{selectedSummary.title}</h1>
              <p className="text-gray-600 font-normal text-base">Read the passages carefully</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => setSelectedSummary(null)}
            className="gap-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Summaries
          </Button>
        </div>
      </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="space-y-6">
            {/* Question */}
            {selectedSummary.question && (() => {
              const color = getRandomColor(0);
              return (
              <div className={`${color.bg} rounded-2xl p-8 border ${color.border} shadow-sm`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                    <Sparkles className={`w-5 h-5 ${color.iconText}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Question</h3>
                </div>
                <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap font-normal">
                  {selectedSummary.question}
                </p>
              </div>
              );
            })()}

            {/* Reading Passages */}
            {selectedSummary.paragraphs && selectedSummary.paragraphs.length > 0 && (
              <div className="space-y-6">
                {selectedSummary.paragraphs.map((passage, index) => {
                  const color = getRandomColor(index + 1);
                  return (
                  <div key={index} className={`${color.bg} rounded-2xl p-8 border ${color.border} shadow-sm`}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`p-2.5 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                        <FileText className={`w-5 h-5 ${color.iconText}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Reading Passage {selectedSummary.paragraphs.length > 1 ? index + 1 : ''}
                        </h3>
                        {selectedSummary.paragraphs.length > 1 && (
                          <p className="text-xs text-gray-500 mt-1 font-normal">Part {index + 1} of {selectedSummary.paragraphs.length}</p>
                        )}
                      </div>
                    </div>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
                        {passage}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
            {/* Fallback to old format (single paragraph) */}
            {(!selectedSummary.paragraphs || selectedSummary.paragraphs.length === 0) && selectedSummary.paragraph && (() => {
              const color = getRandomColor(1);
              return (
              <div className={`${color.bg} rounded-2xl p-8 border ${color.border} shadow-sm`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                    <FileText className={`w-5 h-5 ${color.iconText}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Reading Passage</h3>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap font-normal">
                    {selectedSummary.paragraph}
                  </p>
                </div>
              </div>
              );
            })()}

            {/* Answer Fields removed as requested */}
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
              <BookOpen className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-900">Summarize Exercises</h1>
              <p className="text-gray-600 font-normal text-base">Complete summary exercises and improve your comprehension skills</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/student/dashboard')}
            className="gap-2 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {summaries.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-xl mb-6 border border-gray-200">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Summaries Available</h3>
            <p className="text-gray-600 font-normal text-base">Check back later for new summary exercises.</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Exercises</h2>
                <p className="text-gray-600 font-normal mt-1">{summaries.length} exercise{summaries.length !== 1 ? 's' : ''} available</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {summaries.map((summary, index) => {
                const colors = [
                  { bg: 'bg-pink-50', border: 'border-pink-100', iconBg: 'bg-pink-100', iconBorder: 'border-pink-200', iconText: 'text-pink-700' },
                  { bg: 'bg-purple-50', border: 'border-purple-100', iconBg: 'bg-purple-100', iconBorder: 'border-purple-200', iconText: 'text-purple-700' },
                  { bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', iconBorder: 'border-blue-200', iconText: 'text-blue-700' },
                ];
                const color = colors[index % colors.length];
                return (
                <div
                  key={summary.id}
                  className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-6 hover:shadow-md hover:${color.border.replace('100', '200')} transition-all duration-200 cursor-pointer group`}
                  onClick={() => handleSelectSummary(summary)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 ${color.iconBg} rounded-lg border ${color.iconBorder} group-hover:opacity-80 transition-colors`}>
                      <FileText className={`w-6 h-6 ${color.iconText}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {summary.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-normal">
                      <div className="p-1 bg-gray-100 rounded">
                        <FileText className="w-3 h-3 text-gray-600" />
                      </div>
                      <span>{summary.textInputs.length} response field{summary.textInputs.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {summary.question && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-normal">
                        <div className="p-1 bg-gray-100 rounded">
                          <Sparkles className="w-3 h-3 text-gray-600" />
                        </div>
                        <span>Includes question</span>
                      </div>
                    )}
                    
                    {summary.paragraphs && summary.paragraphs.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 font-normal">
                        <div className="p-1 bg-gray-100 rounded">
                          <BookOpen className="w-3 h-3 text-gray-600" />
                        </div>
                        <span>{summary.paragraphs.length} reading passage{summary.paragraphs.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 font-normal">
                      Created {new Date(summary.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                    <span>Start Exercise</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

