import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { materialAPI, userAPI } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FileText, Download, Eye, Search, Loader, ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function Materials() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [completedIds, setCompletedIds] = useState([]);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    loadMaterials();
    if (user?.id) loadCompletions();
  }, [user?.id]);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory]);

  const loadCompletions = async () => {
    if (!user?.id) return;
    try {
      const data = await userAPI.getCompletions(user.id);
      setCompletedIds(data.completedMaterialIds || []);
    } catch (err) {
      console.error('Error loading completions:', err);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll();
      setMaterials(response.materials || []);
    } catch (err) {
      console.error('Error loading materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (e, materialId) => {
    e.stopPropagation();
    if (!user?.id || togglingId) return;
    setTogglingId(materialId);
    try {
      const res = await userAPI.toggleComplete(user.id, { type: 'material', itemId: materialId });
      setCompletedIds(res.completions?.completedMaterialIds || []);
    } catch (err) {
      console.error('Error toggling completion:', err);
    } finally {
      setTogglingId(null);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.category?.toLowerCase().includes(query)
      );
    }

    setFilteredMaterials(filtered);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categories = ['All', ...new Set(materials.map(m => m.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-gray-700 mx-auto mb-4" />
          <div className="text-xl font-semibold text-gray-700">{language === 'si' ? 'ද්‍රව්‍ය පූරණය වෙමින්...' : 'Loading materials...'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <FileText className="w-8 h-8 text-gray-700" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight text-gray-900">{language === 'si' ? 'අධ්‍යයන ද්‍රව්‍ය' : 'Study Materials'}</h1>
              <p className="text-gray-600 font-normal text-base">{language === 'si' ? 'PDF, සටහන් සහ අධ්‍යයන සම්පත් ප්‍රවේශ වන්න' : 'Access and download study materials'}</p>
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
              placeholder={language === 'si' ? 'ද්‍රව්‍ය සොයන්න...' : 'Search materials...'}
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

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-xl mb-6 border border-gray-200">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{language === 'si' ? 'ද්‍රව්‍ය නොමැත' : 'No Materials Available'}</h3>
            <p className="text-gray-600 font-normal text-base">
              {materials.length === 0 
                ? (language === 'si' ? 'ද්‍රව්‍ය තවමත් නොමැත' : 'No materials available yet')
                : (language === 'si' ? 'ඔබේ සෙවීමට ගැලපෙන ද්‍රව්‍ය නොමැත' : 'No materials match your search')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((material, index) => {
              const colors = [
                { bg: 'bg-green-50', border: 'border-green-100', iconBg: 'bg-green-100', iconBorder: 'border-green-200', iconText: 'text-green-700' },
                { bg: 'bg-emerald-50', border: 'border-emerald-100', iconBg: 'bg-emerald-100', iconBorder: 'border-emerald-200', iconText: 'text-emerald-700' },
                { bg: 'bg-teal-50', border: 'border-teal-100', iconBg: 'bg-teal-100', iconBorder: 'border-teal-200', iconText: 'text-teal-700' },
              ];
              const color = colors[index % colors.length];
              return (
              <div
                key={material.id}
                className={`${color.bg} rounded-2xl shadow-sm border ${color.border} p-6 hover:shadow-md hover:${color.border.replace('100', '200')} transition-all duration-200`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-3 ${color.iconBg} rounded-lg border ${color.iconBorder}`}>
                    <FileText className={`w-6 h-6 ${color.iconText}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{material.title}</h3>
                    {material.category && (
                      <p className="text-xs text-gray-500 font-normal">{material.category}</p>
                    )}
                  </div>
                </div>

                {material.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 font-normal">{material.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4 font-normal">
                  <span>{formatFileSize(material.fileSize)}</span>
                  <span>{formatDate(material.uploadedAt)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleToggleComplete(e, material.id)}
                      disabled={togglingId === material.id}
                      className={`rounded-lg font-medium shrink-0 ${
                        completedIds.includes(material.id)
                          ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      title={completedIds.includes(material.id) ? (language === 'si' ? 'සම්පූර්ණ ලෙස ඉවත් කරන්න' : 'Mark as not completed') : (language === 'si' ? 'සම්පූර්ණ ලෙස සලකුණු කරන්න' : 'Mark as completed')}
                    >
                      {completedIds.includes(material.id) ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Circle className="w-4 h-4 mr-1" />}
                      {completedIds.includes(material.id) ? (language === 'si' ? 'සම්පූර්ණයි' : 'Completed') : (language === 'si' ? 'සම්පූර්ණ කරන්න' : 'Mark complete')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`${BACKEND_URL}${material.filePath}`, '_blank')}
                    className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50 font-medium min-w-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'si' ? 'බලන්න' : 'View'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => materialAPI.download(material.id)}
                    className="flex-1 rounded-lg border-gray-200 hover:bg-gray-50 font-medium min-w-0"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'si' ? 'බාගත' : 'Download'}
                  </Button>
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

