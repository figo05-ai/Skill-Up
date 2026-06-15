import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

console.log('API_BASE:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;