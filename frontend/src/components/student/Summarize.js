import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { summaryAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, FileText, Loader } from 'lucide-react';

export function Summarize() {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-[#667eea] mx-auto mb-4" />
          <div className="text-xl text-gray-600">Loading summaries...</div>
        </div>
      </div>
    );
  }

  if (selectedSummary) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedSummary(null)}
              className="gap-2 rounded-xl text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">{selectedSummary.title}</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Question */}
          {selectedSummary.question && (
            <div className="mb-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Question</h3>
              <p className="text-lg text-blue-900 leading-relaxed whitespace-pre-wrap">
                {selectedSummary.question}
              </p>
            </div>
          )}

          {/* Reading Passages */}
          {selectedSummary.paragraphs && selectedSummary.paragraphs.length > 0 && (
            <div className="mb-8 space-y-6">
              {selectedSummary.paragraphs.map((passage, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Reading Passage {selectedSummary.paragraphs.length > 1 ? index + 1 : ''}
                  </h3>
                  <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {passage}
                  </p>
                </div>
              ))}
            </div>
          )}
          {/* Fallback to old format (single paragraph) */}
          {(!selectedSummary.paragraphs || selectedSummary.paragraphs.length === 0) && selectedSummary.paragraph && (
            <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Reading Passage</h3>
              <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                {selectedSummary.paragraph}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {selectedSummary.textInputs.map((input) => (
              <Textarea
                key={input.id}
                id={input.id}
                value={formData[input.id] || ''}
                onChange={(e) => handleInputChange(input.id, e.target.value)}
                placeholder={input.placeholder || input.label || 'Enter your response...'}
                required={input.required}
                rows={10}
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 resize-none"
              />
            ))}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedSummary(null)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Summary'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/student/dashboard')}
            className="gap-2 rounded-xl text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-semibold mb-2">Summarize</h1>
            <p className="text-white/90">Complete summary exercises and improve your understanding</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {summaries.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Summaries Available</h3>
            <p className="text-gray-600">Check back later for new summary exercises.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all cursor-pointer"
                onClick={() => handleSelectSummary(summary)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{summary.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {summary.textInputs.length} input{summary.textInputs.length !== 1 ? 's' : ''}
                    </p>
                    <div className="text-xs text-gray-400">
                      {new Date(summary.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

