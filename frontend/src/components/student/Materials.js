import { useState, useEffect } from 'react';
import { materialAPI } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { FileText, Download, Eye, Search, Loader } from 'lucide-react';

export function Materials() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory]);

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
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto text-[#667eea] mb-4" />
          <div className="text-xl text-gray-600">Loading materials...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Study Materials</h1>
        <p className="text-gray-600">Access and download study materials</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:outline-none bg-white"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {materials.length === 0 ? 'No materials available yet' : 'No materials match your search'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{material.title}</h3>
                  <p className="text-xs text-gray-500">{material.category}</p>
                </div>
              </div>

              {material.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{material.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{formatFileSize(material.fileSize)}</span>
                <span>{formatDate(material.uploadedAt)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`${BACKEND_URL}${material.filePath}`, '_blank')}
                  className="flex-1 rounded-lg"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => materialAPI.download(material.id)}
                  className="flex-1 rounded-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

