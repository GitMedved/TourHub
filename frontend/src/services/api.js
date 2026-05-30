import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Недостаточно прав для этого действия'));
    }

    if (error.response?.status >= 500) {
      return Promise.reject(new Error('Ошибка сервера. Попробуйте позже'));
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Ошибка сервера';
    return Promise.reject(new Error(message));
  }
);

export default api;
