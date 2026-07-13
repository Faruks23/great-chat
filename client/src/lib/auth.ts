import type { AuthResponse } from '@/services/authService';
import type { User } from '@/types';

const AUTH_TOKEN_COOKIE = 'authToken';
const AUTH_USER_STORAGE = 'authUser';
const REFRESH_BUFFER_MS = 60_000;

export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + AUTH_TOKEN_COOKIE + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setAuthToken(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=3600; samesite=lax`;
}

export function clearAuthToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function getAuthUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(AUTH_USER_STORAGE);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as User;
  } catch {
    return null;
  }
}

export function saveAuthSession(response: AuthResponse) {
  setAuthToken(response.token);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_USER_STORAGE, JSON.stringify(response.user));
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof decoded.exp === 'number' ? decoded.exp * 1000 - Date.now() <= REFRESH_BUFFER_MS : true;
  } catch {
    return true;
  }
}

export function clearAuthSession() {
  clearAuthToken();
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_USER_STORAGE);
  }
}
