// API Configuration
import { API_BASE_URL, BACKEND_URL } from '../config/api.js';

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
  let url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add admin secret to query if provided
  if (options.adminSecret) {
    const separator = endpoint.includes('?') ? '&' : '?';
    url = `${url}${separator}adminSecret=${encodeURIComponent(options.adminSecret)}`;
    delete config.adminSecret;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'API request failed');
    }

    if (!response.ok) {
      const error = new Error(data.error || `API request failed with status ${response.status}`);
      // Attach response data to error for special error handling
      error.response = { data, status: response.status };
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// User API
export const userAPI = {
  signup: (formData, recaptchaToken) => apiRequest('/users/signup', {
    method: 'POST',
    body: JSON.stringify({ ...formData, recaptchaToken: recaptchaToken || undefined }),
  }),

  login: async (email, password, recaptchaToken) => {
    try {
      return await apiRequest('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, recaptchaToken: recaptchaToken || undefined }),
      });
    } catch (error) {
      throw error;
    }
  },

  getUserStats: (userId) => apiRequest(`/users/${userId}/stats`),

  updateGeneralKnowledgeProgress: (userId, index) => apiRequest(`/users/${userId}/general-knowledge-progress`, {
    method: 'PUT',
    body: JSON.stringify({ index }),
  }),

  getProgress: (userId) => apiRequest(`/users/${userId}/progress`),

  getCompletions: (userId) => apiRequest(`/users/${userId}/completions`),

  toggleComplete: (userId, body) => apiRequest(`/users/${userId}/complete`, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  getAllUsers: (adminSecret) => apiRequest('/users', {
    adminSecret,
  }),

  getUserById: (userId, adminSecret) => apiRequest(`/users/${userId}`, {
    adminSecret,
  }),

  updateUser: (userId, updates, adminSecret) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),

  deleteUser: (userId, adminSecret) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
    adminSecret,
  }),

  approveUser: (userId, adminSecret, body = {}) => apiRequest(`/users/${userId}/approve`, {
    method: 'POST',
    adminSecret,
    body: Object.keys(body).length ? JSON.stringify(body) : undefined,
  }),

  rejectUser: (userId, adminSecret) => apiRequest(`/users/${userId}/reject`, {
    method: 'POST',
    adminSecret,
  }),

  suspendUser: (userId, adminSecret) => apiRequest(`/users/${userId}/suspend`, {
    method: 'POST',
    adminSecret,
  }),

  unsuspendUser: (userId, adminSecret) => apiRequest(`/users/${userId}/unsuspend`, {
    method: 'POST',
    adminSecret,
  }),

  verifyOTP: (email, otp) => apiRequest('/users/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),

  resendOTP: (email) => apiRequest('/users/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  updateNotificationPreferences: (userId, preferences) => apiRequest(`/users/${userId}/notification-preferences`, {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }),
};

// MCQ API
export const mcqAPI = {
  getRandom: (userId) => apiRequest(`/mcqs/random?userId=${userId}`),

  getGeneralKnowledgeNotes: () => apiRequest('/mcqs/notes/general-knowledge'),

  submitAnswer: (userId, mcqId, selectedAnswer) => apiRequest('/mcqs/submit', {
    method: 'POST',
    body: JSON.stringify({ userId, mcqId, selectedAnswer }),
  }),

  getAll: (adminSecret) => {
    // Use admin route if adminSecret is provided
    if (adminSecret) {
      return apiRequest('/mcqs/admin/all', {
        adminSecret,
      });
    }
    return apiRequest('/mcqs');
  },

  getById: (mcqId, adminSecret) => apiRequest(`/mcqs/${mcqId}`, {
    adminSecret,
  }),

  create: (mcqData, adminSecret, imageFile) => {
    const formData = new FormData();
    formData.append('question', mcqData.question);
    formData.append('optionA', mcqData.optionA);
    formData.append('optionB', mcqData.optionB);
    formData.append('optionC', mcqData.optionC);
    formData.append('optionD', mcqData.optionD);
    formData.append('answer', mcqData.answer);
    if (mcqData.category) formData.append('category', mcqData.category);
    if (imageFile) formData.append('image', imageFile);

    const url = `${API_BASE_URL}/mcqs${adminSecret ? `?adminSecret=${encodeURIComponent(adminSecret)}` : ''}`;
    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      return data;
    });
  },

  update: (mcqId, updates, adminSecret, imageFile) => {
    const formData = new FormData();
    formData.append('question', updates.question);
    formData.append('optionA', updates.optionA);
    formData.append('optionB', updates.optionB);
    formData.append('optionC', updates.optionC);
    formData.append('optionD', updates.optionD);
    formData.append('answer', updates.answer);
    if (updates.category) formData.append('category', updates.category);
    if (imageFile) formData.append('image', imageFile);

    const url = `${API_BASE_URL}/mcqs/${mcqId}${adminSecret ? `?adminSecret=${encodeURIComponent(adminSecret)}` : ''}`;
    return fetch(url, {
      method: 'PUT',
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      return data;
    });
  },

  delete: (mcqId, adminSecret) => apiRequest(`/mcqs/${mcqId}`, {
    method: 'DELETE',
    adminSecret,
  }),

  uploadCSV: (csvFile, adminSecret) => {
    const formData = new FormData();
    formData.append('csv', csvFile);

    const url = `${API_BASE_URL}/mcqs/upload-csv${adminSecret ? `?adminSecret=${encodeURIComponent(adminSecret)}` : ''}`;
    return fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
    }).then(async (response) => {
      // Handle non-JSON responses
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Failed to upload CSV');
      }

      if (!response.ok) {
        throw new Error(data.error || `Failed to upload CSV: ${response.status} ${response.statusText}`);
      }
      return data;
    }).catch((error) => {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      }
      throw error;
    });
  },
};

// Essay API
export const essayAPI = {
  getAll: () => apiRequest('/essays'),

  getById: (essayId) => apiRequest(`/essays/${essayId}`),

  create: (essayData, adminSecret) => apiRequest('/essays', {
    method: 'POST',
    body: JSON.stringify(essayData),
    adminSecret,
  }),

  update: (essayId, updates, adminSecret) => apiRequest(`/essays/${essayId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),

  delete: (essayId, adminSecret) => apiRequest(`/essays/${essayId}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

// Notification API
export const notificationAPI = {
  getAll: () => apiRequest('/notifications'),

  send: (notificationData, imageFile, adminSecret) => {
    const formData = new FormData();
    formData.append('title', notificationData.title);
    formData.append('message', notificationData.message);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const separator = '/notifications'.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}/notifications${separator}adminSecret=${adminSecret}`;

    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }
      return data;
    });
  },

  delete: (notificationId, adminSecret) => apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

// Settings API
export const settingsAPI = {
  get: (adminSecret) => apiRequest('/settings', {
    adminSecret,
  }),

  update: (updates, adminSecret) => apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),

  testSMTP: (adminSecret) => apiRequest('/settings/test-smtp', {
    method: 'POST',
    adminSecret,
  }),
};

// Admin API
export const adminAPI = {
  login: (email, password, recaptchaToken) => apiRequest('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, recaptchaToken: recaptchaToken || undefined }),
  }),
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: (adminSecret) => apiRequest('/analytics', {
    adminSecret,
  }),
};

// WhatsApp API
export const whatsappAPI = {
  getStatus: (adminSecret) => apiRequest('/whatsapp/status', {
    adminSecret,
  }),

  connect: (adminSecret) => apiRequest('/whatsapp/connect', {
    method: 'POST',
    adminSecret,
  }),

  disconnect: (adminSecret) => apiRequest('/whatsapp/disconnect', {
    method: 'POST',
    body: JSON.stringify({ clearSession: true }),
    adminSecret,
  }),

  sendMessage: (phoneNumber, message, adminSecret) => apiRequest('/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber, message }),
    adminSecret,
  }),
};

// Materials API
export const materialAPI = {
  getAll: () => apiRequest('/materials'),

  getById: (materialId) => apiRequest(`/materials/${materialId}`),

  download: async (materialId) => {
    // First get material info to get filename
    const material = await apiRequest(`/materials/${materialId}`);
    const url = `${API_BASE_URL}/materials/${materialId}/download`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download material');
    }
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = material.fileName || `material-${materialId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  },

  upload: (formData, adminSecret) => {
    const url = `${API_BASE_URL}/materials${adminSecret ? `?adminSecret=${encodeURIComponent(adminSecret)}` : ''}`;
    return fetch(url, {
      method: 'POST',
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload material');
      }
      return data;
    });
  },

  delete: (materialId, adminSecret) => apiRequest(`/materials/${materialId}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

// Helper to get admin secret from localStorage
export const getAdminSecret = () => {
  return localStorage.getItem('adminSecret') || 'admin123';
};

// Helper to set admin secret in localStorage
export const setAdminSecret = (secret) => {
  localStorage.setItem('adminSecret', secret);
};

// Summary API
export const summaryAPI = {
  getAll: () => apiRequest('/summaries'),

  getById: (summaryId) => apiRequest(`/summaries/${summaryId}`),

  create: (summaryData, adminSecret) => apiRequest('/summaries', {
    method: 'POST',
    body: JSON.stringify(summaryData),
    adminSecret,
  }),

  update: (summaryId, updates, adminSecret) => apiRequest(`/summaries/${summaryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),

  delete: (summaryId, adminSecret) => apiRequest(`/summaries/${summaryId}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

// Structured Question API
export const structuredQuestionAPI = {
  getAll: () => apiRequest('/structured-questions'),

  getById: (questionId) => apiRequest(`/structured-questions/${questionId}`),

  create: (questionData, adminSecret) => apiRequest('/structured-questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
    adminSecret,
  }),

  update: (questionId, updates, adminSecret) => apiRequest(`/structured-questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),

  delete: (questionId, adminSecret) => apiRequest(`/structured-questions/${questionId}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

// Structured Writing API (paragraph + Q&A pairs)
export const structuredWritingAPI = {
  getAll: () => apiRequest('/structured-writings'),
  getById: (id) => apiRequest(`/structured-writings/${id}`),
  create: (data, adminSecret) => apiRequest('/structured-writings', {
    method: 'POST',
    body: JSON.stringify(data),
    adminSecret,
  }),
  update: (id, updates, adminSecret) => apiRequest(`/structured-writings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
    adminSecret,
  }),
  delete: (id, adminSecret) => apiRequest(`/structured-writings/${id}`, {
    method: 'DELETE',
    adminSecret,
  }),
};

