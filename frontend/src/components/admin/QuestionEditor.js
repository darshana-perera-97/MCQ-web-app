import { useState, useEffect } from 'react';
import { mcqAPI, essayAPI, summaryAPI, getAdminSecret } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Trash2, Search, Image as ImageIcon, X, Upload, FileText, Eye, ArrowLeft, CheckSquare, Square } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function QuestionEditor() {
  const [questions, setQuestions] = useState([]);
  const [essays, setEssays] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [questionTypeFilter, setQuestionTypeFilter] = useState('all'); // 'all', 'mcq', 'essay', 'summary'
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvUploadResult, setCsvUploadResult] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedQuestionType, setSelectedQuestionType] = useState(null); // 'mcq', 'essay', or 'summary'
  const [selectedItems, setSelectedItems] = useState([]); // Array of { id, type } objects

  // Generate auto ID for MCQ
  const generateAutoId = () => {
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MCQ-${yymmdd}-${random}`;
  };

  // Generate auto ID for Essay
  const generateEssayAutoId = () => {
    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ESSAY-${yymmdd}-${random}`;
  };

  // MCQ Form State
  const [mcqForm, setMcqForm] = useState({
    id: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    category: '',
  });
  const [mcqImage, setMcqImage] = useState(null);
  const [mcqImagePreview, setMcqImagePreview] = useState(null);

  // Essay Form State
  const [essayForm, setEssayForm] = useState({
    id: '',
    question: '',
    category: '',
  });

  // Summary Form State
  const [summaryForm, setSummaryForm] = useState({
    title: '',
    question: '',
    paragraphs: [''],
  });

  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    loadQuestions();
    // Auto-generate IDs when component mounts
    setMcqForm(prev => ({ ...prev, id: generateAutoId() }));
    setEssayForm(prev => ({ ...prev, id: generateEssayAutoId() }));
  }, []);

  // Reload questions when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      loadQuestions();
      loadEssays();
      loadSummaries();
    }
  }, [activeTab]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const adminSecret = getAdminSecret();
      console.log('Loading questions with admin secret:', adminSecret ? 'Present' : 'Missing');
      const response = await mcqAPI.getAll(adminSecret);
      console.log('Questions response:', response);
      const questionsList = response.mcqs || response || [];
      console.log('Questions list:', questionsList);
      setQuestions(Array.isArray(questionsList) ? questionsList : []);
    } catch (err) {
      console.error('Error loading questions:', err);
      alert(err.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEssays = async () => {
    try {
      const response = await essayAPI.getAll();
      setEssays(response.essays || []);
    } catch (err) {
      console.error('Error loading essays:', err);
      setEssays([]);
    }
  };

  const loadSummaries = async () => {
    try {
      const response = await summaryAPI.getAll();
      setSummaries(response.summaries || []);
    } catch (err) {
      console.error('Error loading summaries:', err);
      setSummaries([]);
    }
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredEssays = essays.filter(
    (e) =>
      e.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.category && e.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get combined filtered results based on question type filter
  const getDisplayItems = () => {
    if (questionTypeFilter === 'mcq') {
      return { items: filteredQuestions, type: 'mcq' };
    } else if (questionTypeFilter === 'essay') {
      return { items: filteredEssays, type: 'essay' };
    } else if (questionTypeFilter === 'summary') {
      const filteredSummaries = summaries.filter(
        (s) =>
          s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return { items: filteredSummaries, type: 'summary' };
    } else {
      // Combine all types
      return { 
        items: [
          ...filteredQuestions.map(q => ({ ...q, _type: 'mcq' })),
          ...filteredEssays.map(e => ({ ...e, _type: 'essay' })),
          ...summaries.map(s => ({ ...s, _type: 'summary' }))
        ], 
        type: 'all' 
      };
    }
  };

  const displayItems = getDisplayItems();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setMcqImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMcqImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setMcqImage(null);
    setMcqImagePreview(null);
  };

  const handleCSVFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please select a CSV file');
        return;
      }
      setCsvFile(file);
      setCsvUploadResult(null);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setCsvUploading(true);
      setCsvUploadResult(null);
      
      const adminSecret = getAdminSecret();
      const data = await mcqAPI.uploadCSV(csvFile, adminSecret);

      setCsvUploadResult({
        success: true,
        message: data.message,
        created: data.created,
        errors: data.errors
      });

      // Reload questions
      await loadQuestions();
      
      // Clear file
      setCsvFile(null);
      const fileInput = document.getElementById('csv-upload');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('CSV upload error:', error);
      setCsvUploadResult({
        success: false,
        message: error.message || 'Failed to upload CSV'
      });
    } finally {
      setCsvUploading(false);
    }
  };

  const handleAddMCQ = async () => {
    if (!mcqForm.questionText || !mcqForm.optionA) {
      window.alert('Please fill in all required fields');
      return;
    }

    try {
      const adminSecret = getAdminSecret();
      // Auto-generate ID if not set
      const questionId = mcqForm.id || generateAutoId();
      const newMCQ = {
        id: questionId,
        question: mcqForm.questionText,
        optionA: mcqForm.optionA,
        optionB: mcqForm.optionB,
        optionC: mcqForm.optionC,
        optionD: mcqForm.optionD,
        answer: mcqForm.correctAnswer,
        category: mcqForm.category || null,
      };

      await mcqAPI.create(newMCQ, adminSecret, mcqImage);
      await loadQuestions();
      
      // Reset form with new auto-generated ID
      setMcqForm({
        id: generateAutoId(),
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        category: '',
      });
      setMcqImage(null);
      setMcqImagePreview(null);
    } catch (err) {
      alert(err.message || 'Failed to create MCQ');
    }
  };

  const handleViewQuestion = (item, type) => {
    setSelectedQuestion(item);
    setSelectedQuestionType(type);
  };

  const handleCloseQuestionView = () => {
    setSelectedQuestion(null);
    setSelectedQuestionType(null);
  };

  const handleDeleteQuestion = async (id, type = 'mcq') => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const adminSecret = getAdminSecret();
      if (type === 'essay') {
        await essayAPI.delete(id, adminSecret);
        await loadEssays();
      } else if (type === 'summary') {
        await summaryAPI.delete(id, adminSecret);
        await loadSummaries();
      } else {
        await mcqAPI.delete(id, adminSecret);
        await loadQuestions();
      }
      // Remove from selected items if it was selected
      setSelectedItems(prev => prev.filter(item => !(item.id === id && item.type === type)));
      // Close view if the deleted item was being viewed
      if (selectedQuestion && selectedQuestion.id === id) {
        handleCloseQuestionView();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to delete');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) return;
    
    try {
      const adminSecret = getAdminSecret();
      let successCount = 0;
      let failCount = 0;
      
      for (const item of selectedItems) {
        try {
          if (item.type === 'essay') {
            await essayAPI.delete(item.id, adminSecret);
          } else if (item.type === 'summary') {
            await summaryAPI.delete(item.id, adminSecret);
          } else {
            await mcqAPI.delete(item.id, adminSecret);
          }
          successCount++;
        } catch (err) {
          console.error(`Failed to delete ${item.id}:`, err);
          failCount++;
        }
      }
      
      // Reload all data
      await loadQuestions();
      await loadEssays();
      await loadSummaries();
      
      // Clear selections
      setSelectedItems([]);
      
      // Close view if any deleted item was being viewed
      if (selectedQuestion && selectedItems.some(item => item.id === selectedQuestion.id)) {
        handleCloseQuestionView();
      }
      
      if (failCount === 0) {
        alert(`Successfully deleted ${successCount} item(s)`);
      } else {
        alert(`Deleted ${successCount} item(s), ${failCount} failed`);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete items');
    }
  };

  const handleToggleSelect = (id, type) => {
    setSelectedItems(prev => {
      const exists = prev.some(item => item.id === id && item.type === type);
      if (exists) {
        return prev.filter(item => !(item.id === id && item.type === type));
      } else {
        return [...prev, { id, type }];
      }
    });
  };

  const handleSelectAll = () => {
    const allItems = displayItems.items.map(item => ({
      id: item.id,
      type: item._type || displayItems.type || (item.question ? 'essay' : 'summary')
    }));
    
    if (selectedItems.length === allItems.length && 
        allItems.every(item => selectedItems.some(sel => sel.id === item.id && sel.type === item.type))) {
      // Deselect all
      setSelectedItems([]);
    } else {
      // Select all
      setSelectedItems(allItems);
    }
  };

  const isItemSelected = (id, type) => {
    return selectedItems.some(item => item.id === id && item.type === type);
  };

  const isAllSelected = () => {
    if (displayItems.items.length === 0) return false;
    return displayItems.items.every(item => {
      const type = item._type || displayItems.type || (item.question ? 'essay' : 'summary');
      return isItemSelected(item.id, type);
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Question Editor</h1>
        <p className="text-gray-600">Create and manage MCQ and essay type questions</p>
      </div>

      <Tabs defaultValue="add" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 p-1.5 rounded-xl w-full max-w-2xl">
          <TabsTrigger 
            value="add" 
            className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667eea] data-[state=active]:to-[#764ba2] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Questions
          </TabsTrigger>
          <TabsTrigger 
            value="manage" 
            className="flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#667eea] data-[state=active]:to-[#764ba2] data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
          >
            <Search className="w-4 h-4 mr-2" />
            Manage Questions
          </TabsTrigger>
        </TabsList>

        {/* Add Question Tab */}
        <TabsContent value="add" className="space-y-6">
          <Tabs defaultValue="mcq" className="space-y-6">
            <TabsList className="bg-gray-50 border border-gray-200 p-1.5 rounded-xl w-full max-w-3xl">
              <TabsTrigger 
                value="mcq" 
                className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#667eea] data-[state=active]:font-semibold transition-all"
              >
                Single MCQ
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#667eea] data-[state=active]:font-semibold transition-all"
              >
                <Upload className="w-4 h-4 mr-2" />
                CSV Upload
              </TabsTrigger>
              <TabsTrigger 
                value="essay" 
                className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#667eea] data-[state=active]:font-semibold transition-all"
              >
                Essay Type
              </TabsTrigger>
              <TabsTrigger 
                value="summarize" 
                className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#667eea] data-[state=active]:font-semibold transition-all"
              >
                Summarize
              </TabsTrigger>
            </TabsList>

            {/* MCQ Form */}
            <TabsContent value="mcq" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Single MCQ</h3>
                  <p className="text-sm text-gray-600">Create a new multiple choice question manually</p>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="mcq-id">Question ID (Auto-generated)</Label>
                      <Input
                        id="mcq-id"
                        placeholder="Auto-generated"
                        value={mcqForm.id}
                        readOnly
                        className="rounded-xl border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">ID is automatically generated</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mcq-category">Category (Optional)</Label>
                      <Input
                        id="mcq-category"
                        placeholder="e.g., JavaScript, React, etc."
                        value={mcqForm.category}
                        onChange={(e) => setMcqForm({ ...mcqForm, category: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mcq-question">Question Text *</Label>
                    <Textarea
                      id="mcq-question"
                      placeholder="Enter your question here..."
                      value={mcqForm.questionText}
                      onChange={(e) => setMcqForm({ ...mcqForm, questionText: e.target.value })}
                      className="rounded-xl border-gray-200 min-h-[100px]"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="mcq-image">Question Image (Optional)</Label>
                    <div className="space-y-3">
                      {mcqImagePreview ? (
                        <div className="relative">
                          <img
                            src={mcqImagePreview}
                            alt="Preview"
                            className="w-full max-w-md h-auto rounded-xl border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label
                          htmlFor="mcq-image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-10 h-10 mb-2 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input
                            id="mcq-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="option-a">Option A *</Label>
                      <Input
                        id="option-a"
                        placeholder="First option"
                        value={mcqForm.optionA}
                        onChange={(e) => setMcqForm({ ...mcqForm, optionA: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-b">Option B *</Label>
                      <Input
                        id="option-b"
                        placeholder="Second option"
                        value={mcqForm.optionB}
                        onChange={(e) => setMcqForm({ ...mcqForm, optionB: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-c">Option C *</Label>
                      <Input
                        id="option-c"
                        placeholder="Third option"
                        value={mcqForm.optionC}
                        onChange={(e) => setMcqForm({ ...mcqForm, optionC: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="option-d">Option D *</Label>
                      <Input
                        id="option-d"
                        placeholder="Fourth option"
                        value={mcqForm.optionD}
                        onChange={(e) => setMcqForm({ ...mcqForm, optionD: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correct-answer">Correct Answer *</Label>
                    <div className="flex gap-3">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <button
                          key={option}
                          onClick={() => setMcqForm({ ...mcqForm, correctAnswer: option })}
                          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                            mcqForm.correctAnswer === option
                              ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAddMCQ}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white gap-2 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Add MCQ Question
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* CSV Upload Form */}
            <TabsContent value="csv" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload MCQs from CSV</h3>
                  <p className="text-sm text-gray-600">Bulk upload multiple choice questions from a CSV file</p>
                </div>
                
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-blue-900">CSV Format Requirements:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                          <li>CSV must include headers: <code className="bg-blue-100 px-1 rounded">question, optionA, optionB, optionC, optionD, answer</code></li>
                          <li>Optional column: <code className="bg-blue-100 px-1 rounded">category</code></li>
                          <li>Answer must be A, B, C, or D</li>
                          <li>First row should be the header row</li>
                        </ul>
                        <p className="text-xs text-blue-700 mt-2">
                          Example: <code className="bg-blue-100 px-1 rounded">"What is 2+2?","4","5","6","7","A","Math"</code>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-3">
                    <Label htmlFor="csv-upload">Select CSV File</Label>
                    <label
                      htmlFor="csv-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">CSV file only</p>
                        {csvFile && (
                          <p className="text-sm text-gray-700 mt-2 font-medium">
                            Selected: {csvFile.name}
                          </p>
                        )}
                      </div>
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleCSVFileChange}
                        className="hidden"
                        disabled={csvUploading}
                      />
                    </label>
                  </div>

                  {/* Upload Result */}
                  {csvUploadResult && (
                    <div className={`p-4 rounded-xl border ${
                      csvUploadResult.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`font-semibold ${
                        csvUploadResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {csvUploadResult.success ? '✓ Success!' : '✗ Error'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        csvUploadResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {csvUploadResult.message}
                      </p>
                      {csvUploadResult.success && csvUploadResult.created !== undefined && (
                        <p className="text-sm text-green-800 mt-1">
                          Created {csvUploadResult.created} MCQ(s)
                        </p>
                      )}
                      {csvUploadResult.errors && csvUploadResult.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-semibold text-yellow-800">Errors:</p>
                          <ul className="list-disc list-inside text-xs text-yellow-700 mt-1 space-y-1">
                            {csvUploadResult.errors.slice(0, 5).map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                            {csvUploadResult.errors.length > 5 && (
                              <li>... and {csvUploadResult.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleCSVUpload}
                      disabled={!csvFile || csvUploading}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:opacity-90 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {csvUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload CSV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Essay Form */}
            <TabsContent value="essay" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Essay Type Question</h3>
                  <p className="text-sm text-gray-600">Create a new essay type question</p>
                </div>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="essay-id">Question ID (Auto-generated)</Label>
                      <Input
                        id="essay-id"
                        placeholder="Auto-generated"
                        value={essayForm.id}
                        readOnly
                        className="rounded-xl border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500">ID is automatically generated</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="essay-category">Category (Optional)</Label>
                      <Input
                        id="essay-category"
                        placeholder="e.g., Programming, Theory, etc."
                        value={essayForm.category}
                        onChange={(e) => setEssayForm({ ...essayForm, category: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="essay-question">Question Text *</Label>
                    <Textarea
                      id="essay-question"
                      placeholder="Enter your essay question here..."
                      value={essayForm.question}
                      onChange={(e) => setEssayForm({ ...essayForm, question: e.target.value })}
                      className="rounded-xl border-gray-200 min-h-[150px]"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      if (!essayForm.question) {
                        alert('Please fill in the question field');
                        return;
                      }
                      try {
                        const adminSecret = getAdminSecret();
                        // Auto-generate ID if not set
                        const questionId = essayForm.id || generateEssayAutoId();
                        await essayAPI.create({
                          id: questionId,
                          question: essayForm.question,
                          category: essayForm.category || null,
                        }, adminSecret);
                        // Reset form with new auto-generated ID
                        setEssayForm({ 
                          id: generateEssayAutoId(), 
                          question: '', 
                          category: '' 
                        });
                        alert('Essay question created successfully');
                      } catch (err) {
                        alert(err.message || 'Failed to create essay question');
                      }
                    }}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00c6ff] to-[#0072ff] hover:opacity-90 text-white gap-2 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Add Essay Question
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Summarize Form */}
            <TabsContent value="summarize" className="mt-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Summarize Exercise</h3>
                  <p className="text-sm text-gray-600">Create a new summary exercise with title, question, and reading passage</p>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="summary-title">Title *</Label>
                    <Input
                      id="summary-title"
                      placeholder="e.g., Chapter 1 Summary, Article Analysis, etc."
                      value={summaryForm.title}
                      onChange={(e) => setSummaryForm({ ...summaryForm, title: e.target.value })}
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary-question">Question (Optional)</Label>
                    <Textarea
                      id="summary-question"
                      placeholder="Enter the question or prompt for this summary exercise..."
                      value={summaryForm.question}
                      onChange={(e) => setSummaryForm({ ...summaryForm, question: e.target.value })}
                      className="rounded-xl border-gray-200 min-h-[120px] resize-none"
                      rows={5}
                    />
                    <p className="text-xs text-gray-500">Provide a question or prompt that students should answer</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Reading Passages (Optional)</Label>
                      <Button
                        type="button"
                        onClick={() => {
                          setSummaryForm({
                            ...summaryForm,
                            paragraphs: [...summaryForm.paragraphs, '']
                          });
                        }}
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Reading Passage
                      </Button>
                    </div>
                    {summaryForm.paragraphs.map((paragraph, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`summary-paragraph-${index}`}>
                            Reading Passage {index + 1}
                          </Label>
                          {summaryForm.paragraphs.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => {
                                const newParagraphs = summaryForm.paragraphs.filter((_, i) => i !== index);
                                setSummaryForm({ ...summaryForm, paragraphs: newParagraphs });
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <Textarea
                          id={`summary-paragraph-${index}`}
                          placeholder="Enter the reading passage, article, or paragraph that students should summarize..."
                          value={paragraph}
                          onChange={(e) => {
                            const newParagraphs = [...summaryForm.paragraphs];
                            newParagraphs[index] = e.target.value;
                            setSummaryForm({ ...summaryForm, paragraphs: newParagraphs });
                          }}
                          className="rounded-xl border-gray-200 min-h-[200px] resize-none"
                          rows={10}
                        />
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Provide one or more reading passages that students need to read and summarize</p>
                  </div>


                  <Button
                    onClick={async () => {
                      if (!summaryForm.title) {
                        alert('Please enter a title');
                        return;
                      }
                      try {
                        const adminSecret = getAdminSecret();
                        // Auto-create a single textarea input
                        await summaryAPI.create({
                          title: summaryForm.title,
                          question: summaryForm.question,
                          paragraphs: summaryForm.paragraphs.filter(p => p.trim() !== ''),
                          textInputs: [{ label: 'Summary', placeholder: 'Enter your summary here...', required: true, inputType: 'paragraph' }],
                        }, adminSecret);
                        setSummaryForm({
                          title: '',
                          question: '',
                          paragraphs: [''],
                        });
                        alert('Summary exercise created successfully');
                        loadSummaries();
                      } catch (err) {
                        alert(err.message || 'Failed to create summary exercise');
                      }
                    }}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4facfe] to-[#00f2fe] hover:opacity-90 text-white gap-2 shadow-sm"
                  >
                    <Plus className="w-5 h-5" />
                    Add Summarize Exercise
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Manage Questions Tab */}
        <TabsContent value="manage" className="space-y-6 mt-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Manage Questions</h3>
                <p className="text-sm text-gray-600">Search, view, and delete existing questions</p>
              </div>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedItems.length} selected
                  </span>
                  <Button
                    onClick={handleBulkDelete}
                    variant="destructive"
                    className="rounded-lg h-10 px-4 gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search questions by ID, text, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-gray-200"
                />
              </div>
              <select
                value={questionTypeFilter}
                onChange={(e) => {
                  setQuestionTypeFilter(e.target.value);
                  setSelectedItems([]); // Clear selections when filter changes
                }}
                className="px-4 py-3 h-12 rounded-xl border border-gray-300 focus:border-[#667eea] focus:ring-2 focus:ring-[#667eea]/30 focus:outline-none bg-white"
              >
                <option value="all">All Questions</option>
                <option value="mcq">MCQ Questions</option>
                <option value="essay">Essay Questions</option>
                <option value="summary">Summarize Exercises</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-xl text-gray-600">Loading questions...</div>
            </div>
          ) : displayItems.items.length === 0 && questions.length === 0 && essays.length === 0 && summaries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h4>
              <p className="text-gray-600 mb-4">Start by adding your first question using the "Add Questions" tab.</p>
            </div>
          ) : (
            /* Questions List */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {displayItems.items.length > 0 && (
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {isAllSelected() ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                    <span>Select All ({displayItems.items.length})</span>
                  </button>
                </div>
              )}
              <div className="divide-y divide-gray-100">
                {displayItems.items.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 mb-2">No questions match your search</p>
                    <p className="text-sm text-gray-400">Try a different search term or filter</p>
                  </div>
                ) : (
                  displayItems.items.map((item) => {
                    const isEssay = item._type === 'essay' || displayItems.type === 'essay';
                    const isSummary = item._type === 'summary' || displayItems.type === 'summary';
                    const itemType = isSummary ? 'summary' : isEssay ? 'essay' : 'mcq';
                    const isSelected = isItemSelected(item.id, itemType);
                    
                    return (
                      <div key={item.id} className={`p-6 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleToggleSelect(item.id, itemType)}
                              className="mt-1 flex-shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-blue-600" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                            <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <button
                                onClick={() => {
                                  if (isSummary) {
                                    setSelectedQuestion(item);
                                    setSelectedQuestionType('summary');
                                  } else {
                                    handleViewQuestion(item, isEssay ? 'essay' : 'mcq');
                                  }
                                }}
                                className={`inline-flex items-center px-3 py-1 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${
                                  isSummary
                                    ? 'bg-gradient-to-r from-[#4facfe]/20 to-[#00f2fe]/20 hover:from-[#4facfe]/30 hover:to-[#00f2fe]/30'
                                    : isEssay 
                                    ? 'bg-gradient-to-r from-[#fa709a]/20 to-[#fee140]/20 hover:from-[#fa709a]/30 hover:to-[#fee140]/30'
                                    : 'bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20 hover:from-[#667eea]/30 hover:to-[#764ba2]/30'
                                }`}
                              >
                                <Eye className="w-3 h-3 mr-1.5" />
                                <span className={`text-sm font-semibold ${
                                  isSummary
                                    ? 'bg-gradient-to-r from-[#4facfe] to-[#00f2fe] bg-clip-text text-transparent'
                                    : isEssay
                                    ? 'bg-gradient-to-r from-[#fa709a] to-[#fee140] bg-clip-text text-transparent'
                                    : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent'
                                }`}>
                                  {item.id}
                                </span>
                              </button>
                              {item.category && (
                                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100">
                                  <span className="text-sm font-medium text-gray-600">
                                    {item.category}
                                  </span>
                                </div>
                              )}
                              {isSummary && (
                                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-[#4facfe]/10 to-[#00f2fe]/10">
                                  <span className="text-sm font-medium text-[#4facfe]">
                                    Summarize
                                  </span>
                                </div>
                              )}
                              {isEssay && (
                                <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-[#fa709a]/10 to-[#fee140]/10">
                                  <span className="text-sm font-medium text-[#fa709a]">
                                    Essay Type
                                  </span>
                                </div>
                              )}
                            </div>
                            {isSummary ? (
                              <>
                                <p className="text-gray-900 font-medium mb-3">{item.title}</p>
                                <p className="text-sm text-gray-500 mb-2">
                                  {item.textInputs?.length || 0} text input{item.textInputs?.length !== 1 ? 's' : ''}
                                </p>
                              </>
                            ) : (
                              <p className="text-gray-900 font-medium mb-3">{item.question}</p>
                            )}
                            
                            {!isEssay && (
                              <>
                                {item.image && (
                                  <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 max-w-md">
                                    <img
                                      src={`${BACKEND_URL}${item.image}`}
                                      alt="Question"
                                      className="w-full h-auto max-h-48 object-contain bg-gray-50"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {[
                                    { label: 'A', text: item.optionA },
                                    { label: 'B', text: item.optionB },
                                    { label: 'C', text: item.optionC },
                                    { label: 'D', text: item.optionD },
                                  ].map((option) => (
                                    <div
                                      key={option.label}
                                      className={`flex items-center gap-2 p-2 rounded-lg ${
                                        option.label === item.answer
                                          ? 'bg-green-50 border border-green-200'
                                          : 'bg-gray-50'
                                      }`}
                                    >
                                      <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm font-semibold ${
                                        option.label === item.answer
                                          ? 'bg-green-500 text-white'
                                          : 'bg-gray-200 text-gray-600'
                                      }`}>
                                        {option.label}
                                      </div>
                                      <span className="text-sm text-gray-700">{option.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            
                            {isEssay && item.answer && (
                              <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-sm font-semibold text-green-700 mb-2">Sample Answer:</div>
                                <p className="text-sm text-green-900 whitespace-pre-wrap">{item.answer}</p>
                              </div>
                            )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(item.id, itemType)}
                            className="rounded-lg hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {/* Questions Count */}
          {!loading && (questions.length > 0 || essays.length > 0 || summaries.length > 0) && (
            <div className="text-center text-sm text-gray-500">
              Showing {displayItems.items.length} of {questions.length + essays.length + summaries.length} item{(questions.length + essays.length + summaries.length) !== 1 ? 's' : ''}
              {questionTypeFilter === 'all' && (
                <span className="ml-2">
                  ({questions.length} MCQ{questions.length !== 1 ? 's' : ''}, {essays.length} Essay{essays.length !== 1 ? 's' : ''}, {summaries.length} Summar{summaries.length !== 1 ? 'ies' : 'y'})
                </span>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <Dialog open={!!selectedQuestion} onOpenChange={handleCloseQuestionView}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseQuestionView}
                  className="rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-2xl font-semibold text-gray-900">
                  {selectedQuestionType === 'summary' ? 'Summary Details' : 'Question Details'} - {selectedQuestion.id}
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                {selectedQuestionType === 'summary' 
                  ? 'Summarize Exercise' 
                  : selectedQuestionType === 'essay' 
                  ? 'Essay Type Question' 
                  : 'MCQ Question'}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Question Info */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                  selectedQuestionType === 'essay'
                    ? 'bg-gradient-to-r from-[#fa709a]/10 to-[#fee140]/10'
                    : 'bg-gradient-to-r from-[#667eea]/10 to-[#764ba2]/10'
                }`}>
                  <span className={`text-sm font-medium ${
                    selectedQuestionType === 'essay'
                      ? 'text-[#fa709a]'
                      : 'text-[#667eea]'
                  }`}>
                    {selectedQuestion.id}
                  </span>
                </div>
                {selectedQuestion.category && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{selectedQuestion.category}</span>
                  </div>
                )}
                {selectedQuestionType === 'essay' && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#fa709a]/10 to-[#fee140]/10 rounded-xl">
                    <span className="text-sm font-medium text-[#fa709a]">Essay Type</span>
                  </div>
                )}
              </div>

              {/* Question Content */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Question</h3>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* MCQ Options */}
              {selectedQuestionType === 'mcq' && (
                <>
                  {selectedQuestion.image && (
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={`${BACKEND_URL}${selectedQuestion.image}`}
                        alt="Question"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Options</h3>
                    {[
                      { label: 'A', text: selectedQuestion.optionA },
                      { label: 'B', text: selectedQuestion.optionB },
                      { label: 'C', text: selectedQuestion.optionC },
                      { label: 'D', text: selectedQuestion.optionD },
                    ].map((option) => (
                      <div
                        key={option.label}
                        className={`p-4 rounded-xl border-2 ${
                          option.label === selectedQuestion.answer
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-semibold ${
                            option.label === selectedQuestion.answer
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {option.label}
                          </div>
                          <span className="text-base text-gray-900">{option.text}</span>
                          {option.label === selectedQuestion.answer && (
                            <span className="ml-auto px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Summary Details */}
              {selectedQuestionType === 'summary' && (
                <>
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedQuestion.title}</h3>
                    </div>
                    
                    {selectedQuestion.question && (
                      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2 uppercase tracking-wide">Question</h4>
                        <p className="text-base text-blue-900 leading-relaxed whitespace-pre-wrap">
                          {selectedQuestion.question}
                        </p>
                      </div>
                    )}

                    {selectedQuestion.paragraphs && selectedQuestion.paragraphs.length > 0 && (
                      <div className="space-y-4">
                        {selectedQuestion.paragraphs.map((passage, index) => (
                          <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                              Reading Passage {selectedQuestion.paragraphs.length > 1 ? index + 1 : ''}
                            </h4>
                            <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {passage}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Fallback to old format */}
                    {(!selectedQuestion.paragraphs || selectedQuestion.paragraphs.length === 0) && selectedQuestion.paragraph && (
                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Reading Passage</h4>
                        <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                          {selectedQuestion.paragraph}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Textarea Inputs</h4>
                      {selectedQuestion.textInputs?.map((input, index) => (
                        <div key={input.id || index} className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-900">{input.label}</span>
                            {input.required && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                                Required
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">
                              Textarea
                            </span>
                          </div>
                          {input.placeholder && (
                            <p className="text-sm text-gray-500 italic">Placeholder: {input.placeholder}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Essay Answer */}
              {selectedQuestionType === 'essay' && selectedQuestion.answer && (
                <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                  <h3 className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Sample Answer</h3>
                  <p className="text-base text-green-900 leading-relaxed whitespace-pre-wrap">
                    {selectedQuestion.answer}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleCloseQuestionView}
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                <Button
                  onClick={() => handleDeleteQuestion(selectedQuestion.id, selectedQuestionType)}
                  variant="outline"
                  className="rounded-xl h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

