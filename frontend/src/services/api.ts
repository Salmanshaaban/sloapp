import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL as string) || '';

// Note: backend routes are mounted under /api
// On Vercel, API_URL can be empty (same-origin), and the backend handles /api routes
const api = axios.create({
  baseURL: API_URL ? `${API_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

