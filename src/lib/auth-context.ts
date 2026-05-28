import { createContext } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

export const AUTH_KEY = 'xarajat-taqsimlagich.auth';
export const AuthContext = createContext<AuthContextValue | null>(null);
