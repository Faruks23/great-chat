import api from '@/lib/axios';

export interface AuthCredentials {
  name?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

export async function login(credentials: Omit<AuthCredentials, 'name'>): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  return response.data;
}

export async function refreshSession(token: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/refresh', { token });
  return response.data;
}
