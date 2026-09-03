import axios from 'axios';

// Dynamic API Base URL resolution for both local development and cloud hosting
export const API_BASE_URL = (() => {
  // When running in local browser, default to local backend on port 5005
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const explicitLocal = import.meta.env.VITE_LOCAL_API_URL;
      if (explicitLocal) return explicitLocal.trim().replace(/\/+$/, '');
      const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
      if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
        return envUrl.trim().replace(/\/+$/, '');
      }
      return 'http://localhost:5005/api';
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Default live backend on cloud hosting (Render)
  return 'https://zoee-backend.onrender.com/api';
})();

export const getApiUrl = (path = '') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL.startsWith('http')) {
    return `${API_BASE_URL.replace(/\/+$/, '')}${cleanPath}`;
  }
  return `/api${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000
});

// Attach Authorization Bearer token from localStorage & clean up double slashes
api.interceptors.request.use((config) => {
  if (config.url && config.url.includes('//') && !config.url.startsWith('http')) {
    config.url = config.url.replace(/\/+/g, '/');
  }
  const token = localStorage.getItem('dara_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// Normalize API error response
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;

