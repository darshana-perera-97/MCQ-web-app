import { useState, useEffect } from 'react';
import { essayAPI } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { PenTool, Search, Loader, X, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function EssaysModal({ open, onOpenChange }) {
  const [essays, setEssays] = useState([]);
  const [filteredEssays, setFilteredEssays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEssay, setSelectedEssay] = useState(null);

  useEffect(() => {
    if (open) {
      loadEssays();
    }
  }, [open]);

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

  const handleCardClick = (essay) => {
    setSelectedEssay(essay);
  };

  const handleBackToList = () => {
    setSelectedEssay(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto bg-white">
        {!selectedEssay ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">Essay Type Questions</DialogTitle>
              <DialogDescription className="text-gray-600">
                Practice essay questions to improve your writing skills
              </DialogDescription>
            </DialogHeader>

            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin mx-auto text-[#667eea] mb-4" />
                <div className="text-xl text-gray-600">Loading essay questions...</div>
              </div>
            ) : (
              <>
                {/* Search and Filter */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search essay questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 h-12 rounded-xl border border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:outline-none bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Essays Card Grid */}
                {filteredEssays.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
                    <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {essays.length === 0 ? 'No essay questions available yet' : 'No essay questions match your search'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {filteredEssays.map((essay) => (
                      <div
                        key={essay.id}
                        onClick={() => handleCardClick(essay)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer hover:border-[#fa709a]"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#fa709a] to-[#fee140] rounded-xl flex items-center justify-center flex-shrink-0">
                            <PenTool className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{essay.id}</h3>
                            {essay.category && (
                              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg">
                                {essay.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                          {essay.question}
                        </p>
                        {essay.createdAt && (
                          <div className="text-xs text-gray-500">
                            {formatDate(essay.createdAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Essay Detail View */}
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-2xl font-semibold text-gray-900">Essay Question</DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                Read and practice this essay question
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Essay Info */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fa709a]/10 to-[#fee140]/10 rounded-xl">
                  <PenTool className="w-5 h-5 text-[#fa709a]" />
                  <div className="text-sm font-medium text-gray-900">{selectedEssay.id}</div>
                </div>
                {selectedEssay.category && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                    <div className="text-sm font-medium text-gray-700">{selectedEssay.category}</div>
                  </div>
                )}
                {selectedEssay.createdAt && (
                  <div className="text-sm text-gray-500">
                    {formatDate(selectedEssay.createdAt)}
                  </div>
                )}
              </div>

              {/* Essay Question Content */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Question</h3>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {selectedEssay.question}
                </p>
              </div>

              {/* Answer Section (if available) */}
              {selectedEssay.answer && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Sample Answer</h3>
                  <p className="text-base text-green-900 leading-relaxed whitespace-pre-wrap">
                    {selectedEssay.answer}
                  </p>
                </div>
              )}

              {/* Back Button */}
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="w-full rounded-xl h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Essay List
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

