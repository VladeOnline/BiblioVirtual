import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth services
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
};

// Book services
export const bookService = {
  getAll: (params?: { search?: string; genre?: string }) =>
    api.get('/books', { params }),
  getById: (id: string) => api.get(`/books/${id}`),
  create: (data: FormData) =>
    api.post('/books', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/books/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/books/${id}`),
};

// Manga services
export const mangaService = {
  getAll: (params?: { search?: string; genre?: string }) =>
    api.get('/mangas', { params }),
  getById: (id: string) => api.get(`/mangas/${id}`),
  create: (data: FormData) =>
    api.post('/mangas', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/mangas/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/mangas/${id}`),
};

// Chapter services
export const chapterService = {
  getByManga: (mangaId: string) => api.get(`/chapters/manga/${mangaId}`),
  getById: (id: string) => api.get(`/chapters/${id}`),
  create: (data: FormData) =>
    api.post('/chapters', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/chapters/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => api.delete(`/chapters/${id}`),
};
