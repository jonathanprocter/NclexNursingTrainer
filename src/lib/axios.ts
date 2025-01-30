
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://0.0.0.0:4004/api',
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Handle authentication errors
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
