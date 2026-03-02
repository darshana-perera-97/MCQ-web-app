import { useState, useEffect } from 'react';
import { mcqAPI, essayAPI, getAdminSecret } from '../../services/api';
import { BACKEND_URL } from '../../config/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Trash2, Search, Image as ImageIcon, X, Upload, FileText } from 'lucide-react';

export function QuestionEditor() {
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvUploadResult, setCsvUploadResult] = useState(null);
  
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

  const [activeTab, setActiveTab] = useState('add');

  useEffect(() => {
    loadQuestions();
  }, []);

  // Reload questions when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      loadQuestions();
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

  const filteredQuestions = questions.filter(
    (q) =>
      q.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      const formData = new FormData();
      formData.append('csv', csvFile);

      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3940/api';
      const url = `${baseUrl}/mcqs/upload-csv?adminSecret=${encodeURIComponent(adminSecret)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload CSV');
      }

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
      setCsvUploadResult({
        success: false,
        message: error.message || 'Failed to upload CSV'
      });
    } finally {
      setCsvUploading(false);
    }
  };

  const handleAddMCQ = async () => {
    if (!mcqForm.id || !mcqForm.questionText || !mcqForm.optionA) {
      window.alert('Please fill in all required fields');
      return;
    }

    try {
      const adminSecret = getAdminSecret();
      const newMCQ = {
        id: mcqForm.id,
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
      
      // Reset form
      setMcqForm({
        id: '',
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

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      const adminSecret = getAdminSecret();
      await mcqAPI.delete(id, adminSecret);
      await loadQuestions();
    } catch (err) {
      alert(err.message || 'Failed to delete question');
    }
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
                      <Label htmlFor="mcq-id">Question ID *</Label>
                      <Input
                        id="mcq-id"
                        placeholder="e.g., MCQ-011"
                        value={mcqForm.id}
                        onChange={(e) => setMcqForm({ ...mcqForm, id: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
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
                      <Label htmlFor="essay-id">Question ID *</Label>
                      <Input
                        id="essay-id"
                        placeholder="e.g., ESSAY-001"
                        value={essayForm.id}
                        onChange={(e) => setEssayForm({ ...essayForm, id: e.target.value })}
                        className="rounded-xl border-gray-200"
                      />
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
                      if (!essayForm.id || !essayForm.question) {
                        alert('Please fill in all required fields');
                        return;
                      }
                      try {
                        const adminSecret = getAdminSecret();
                        await essayAPI.create({
                          id: essayForm.id,
                          question: essayForm.question,
                          category: essayForm.category || null,
                        }, adminSecret);
                        setEssayForm({ id: '', question: '', category: '' });
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
          </Tabs>
        </TabsContent>

        {/* Manage Questions Tab */}
        <TabsContent value="manage" className="space-y-6 mt-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Manage Questions</h3>
            <p className="text-sm text-gray-600 mb-4">Search, view, and delete existing questions</p>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search questions by ID, text, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl border-gray-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#667eea] border-t-transparent rounded-full animate-spin mb-4"></div>
              <div className="text-xl text-gray-600">Loading questions...</div>
            </div>
          ) : questions.length === 0 ? (
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
              <div className="divide-y divide-gray-100">
                {filteredQuestions.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 mb-2">No questions match your search</p>
                    <p className="text-sm text-gray-400">Try a different search term</p>
                  </div>
                ) : (
                  filteredQuestions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-[#667eea]/20 to-[#764ba2]/20">
                          <span className="text-sm font-semibold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                            {question.id}
                          </span>
                        </div>
                        {question.category && (
                          <div className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100">
                            <span className="text-sm font-medium text-gray-600">
                              {question.category}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-3">{question.question}</p>
                      {question.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 max-w-md">
                          <img
                            src={`${BACKEND_URL}${question.image}`}
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
                          { label: 'A', text: question.optionA },
                          { label: 'B', text: question.optionB },
                          { label: 'C', text: question.optionC },
                          { label: 'D', text: question.optionD },
                        ].map((option) => (
                          <div
                            key={option.label}
                            className={`flex items-center gap-2 p-2 rounded-lg ${
                              option.label === question.answer
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm font-semibold ${
                              option.label === question.answer
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {option.label}
                            </div>
                            <span className="text-sm text-gray-700">{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="rounded-lg hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {/* Questions Count */}
          {!loading && questions.length > 0 && (
            <div className="text-center text-sm text-gray-500">
              Showing {filteredQuestions.length} of {questions.length} question{questions.length !== 1 ? 's' : ''}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

