import axios from 'axios';
import { ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('skill_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor: automatically unwrap data and handle 401
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('skill_token');
        localStorage.removeItem('skill_user');
        window.location.href = '/login';
      }
    }
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
