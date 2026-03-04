import { useState, useEffect } from 'react';
import { materialAPI, getAdminSecret } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Upload, FileText, Trash2, Download, Eye, X, CheckCircle, XCircle, Loader, Search } from 'lucide-react';

export function Materials() {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    pdfFile: null
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, categoryFilter]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll();
      setMaterials(response.materials || []);
    } catch (err) {
      console.error('Error loading materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    // Filter by category
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(m => m.category === categoryFilter);
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setFormData(prev => ({ ...prev, pdfFile: file }));
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.pdfFile) {
      setError('Please select a PDF file');
      return;
    }
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadResult(null);

      const adminSecret = getAdminSecret();
      const uploadFormData = new FormData();
      uploadFormData.append('pdf', formData.pdfFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);

      const result = await materialAPI.upload(uploadFormData, adminSecret);

      setUploadResult({
        success: true,
        message: result.message,
        notifications: result.notifications
      });
      setSuccess('Material uploaded successfully!');
      setTimeout(() => setSuccess(null), 3000);

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'General',
        pdfFile: null
      });
      const fileInput = document.getElementById('pdf-upload');
      if (fileInput) fileInput.value = '';

      // Reload materials
      await loadMaterials();
      setShowUploadForm(false);
    } catch (err) {
      setError(err.message || 'Failed to upload material');
      setUploadResult({
        success: false,
        message: err.message || 'Failed to upload material'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) {
      return;
    }

    try {
      const adminSecret = getAdminSecret();
      await materialAPI.delete(materialId, adminSecret);
      setSuccess('Material deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
      await loadMaterials();
    } catch (err) {
      setError(err.message || 'Failed to delete material');
    }
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

  const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];
  const totalSize = materials.reduce((sum, m) => sum + (m.fileSize || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Materials</h1>
            <p className="text-gray-600">Manage study materials and PDFs</p>
          </div>
          <Button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="rounded-lg h-11 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Material
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Total Materials</div>
          <div className="text-2xl font-semibold text-gray-900">{materials.length}</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4">
          <div className="text-sm text-blue-700 mb-1">Categories</div>
          <div className="text-2xl font-semibold text-blue-900">{categories.length}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4">
          <div className="text-sm text-green-700 mb-1">Total Size</div>
          <div className="text-2xl font-semibold text-green-900">
            {formatFileSize(totalSize)}
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-200 p-4">
          <div className="text-sm text-purple-700 mb-1">Recent Uploads</div>
          <div className="text-2xl font-semibold text-purple-900">
            {materials.filter(m => {
              const uploadDate = new Date(m.uploadedAt);
              const today = new Date();
              const daysDiff = Math.floor((today - uploadDate) / (1000 * 60 * 60 * 24));
              return daysDiff <= 7;
            }).length}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
          <XCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search materials by title, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-gray-200"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 h-12 rounded-xl border border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:outline-none bg-white"
        >
          <option value="All">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upload New Material</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowUploadForm(false);
                setError(null);
                setUploadResult(null);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter material title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter material description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Input
                id="category"
                type="text"
                placeholder="e.g., General, Mathematics, Science"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf-upload" className="text-sm font-medium text-gray-700">
                PDF File <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="rounded-lg border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:ring-offset-0 h-11"
                required
              />
              {formData.pdfFile && (
                <p className="text-sm text-gray-500">
                  Selected: {formData.pdfFile.name} ({formatFileSize(formData.pdfFile.size)})
                </p>
              )}
            </div>

            {uploadResult && (
              <div className={`p-4 rounded-lg flex items-center gap-2 ${
                uploadResult.success
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <div>
                  <p className="font-medium">{uploadResult.message}</p>
                  {uploadResult.notifications && (
                    <p className="text-sm mt-1">
                      Notifications: Email ({uploadResult.notifications.email.sent} sent), 
                      WhatsApp ({uploadResult.notifications.whatsapp.sent} sent)
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setError(null);
                  setUploadResult(null);
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="rounded-lg h-11 px-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white shadow-sm disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {materials.length === 0 ? 'No materials uploaded yet' : 'No materials match your search'}
          </p>
          {materials.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">Click "Upload Material" to add your first material</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{material.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{material.category}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(material.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {material.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{material.description}</p>
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

