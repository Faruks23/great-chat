import axios from "axios";
import {
  getAuthToken,
  saveAuthSession,
  clearAuthSession,
  isTokenExpired,
} from "@/lib/auth";
import { refreshSession } from "@/services/authService";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (res) => res,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const token = getAuthToken();

          if (!token || isTokenExpired(token)) {
            clearAuthSession();
            return null;
          }

          const response = await refreshSession(token);

          saveAuthSession(response);

          return response.token;
        } catch {
          clearAuthSession();
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization =
      `Bearer ${newToken}`;

    return api(originalRequest);
  }
);

export default api;