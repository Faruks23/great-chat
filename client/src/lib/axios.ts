import axios from 'axios';
import {
  getAuthToken,
  saveAuthSession,
  clearAuthSession,
} from '@/lib/auth';
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
let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error
    if (!error.response) {
      return Promise.reject(error);
    }

    // Not Unauthorized
    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry twice
    if (originalRequest._retry) {
      clearAuthSession();

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = (async () => {
          const token = getAuthToken();

          if (!token) {
            return null;
          }

          const response = await refreshSession(token);

          saveAuthSession(response);

          return response.token;
        })();
      }

      const newToken = await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      if (!newToken) {
        clearAuthSession();

        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }

        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (err) {
      isRefreshing = false;
      refreshPromise = null;

      clearAuthSession();

      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }

      return Promise.reject(err);
    }
  }
);

export default api;