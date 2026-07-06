import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
if (!API_URL) throw new Error('Missing VITE_API_URL');

// Note: backend routes are mounted under /api
const api = axios.create({
  baseURL: `${API_URL}/api`,
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

