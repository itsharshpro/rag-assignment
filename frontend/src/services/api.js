import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const documentService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocuments: async () => {
    const response = await api.get('/documents');
    return response.data;
  },

  getDocument: async (documentId) => {
    const response = await api.get(`/documents/${documentId}`);
    return response.data;
  },

  getDocumentChunks: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/chunks`);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};

export const qaService = {
  askQuestion: async (question, documentIds = null) => {
    const payload = { question };
    if (documentIds) {
      if (Array.isArray(documentIds)) {
        payload.documentIds = documentIds;
      } else {
        // Handle single document ID for backward compatibility
        payload.documentIds = [documentIds];
      }
    }
    const response = await api.post('/qa/ask', payload);
    return response.data;
  },

  searchChunks: async (query) => {
    const response = await api.post('/qa/search', { query });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/qa/history');
    return response.data;
  },
};

export default api;
