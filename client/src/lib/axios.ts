import axios from 'axios';
import { getAuthToken, saveAuthSession, clearAuthSession, isTokenExpired } from '@/lib/auth';
import { refreshSession } from '@/services/authService';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || !error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      await refreshPromise;
      return api(originalRequest);
    }

    isRefreshing = true;
    refreshPromise = (async () => {
      const token = getAuthToken();
      if (!token || isTokenExpired(token)) {
        clearAuthSession();
        window.location.href = '/login';
        return;
      }

      try {
        const response = await refreshSession(token);
        saveAuthSession(response);
        originalRequest.headers.Authorization = `Bearer ${response.token}`;
      } catch {
        clearAuthSession();
        window.location.href = '/login';
      }
    })();

    try {
      await refreshPromise;
      return api(originalRequest);
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }
);

export default api;

