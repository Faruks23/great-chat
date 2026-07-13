export interface AuthCredentials {
  email?: string;
  phone?: string;
  password: string;
  name?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
