import { apiClient, apiRequest } from '@/shared/api/client';
import type { User } from '@/shared/types';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthPayload extends AuthTokens {
  user?: User;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  password2: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Register a new user and receive SimpleJWT tokens. */
export function register(payload: RegisterPayload) {
  return apiRequest<AuthPayload>(apiClient.post('/auth/register/', payload));
}

/** Login with email/password and receive SimpleJWT tokens. */
export function login(payload: LoginPayload) {
  return apiRequest<AuthTokens>(apiClient.post('/auth/login/', payload));
}

/** Fetch current authenticated user profile. */
export function getMe() {
  return apiRequest<User>(apiClient.get('/auth/me/'));
}

/** Blacklist refresh token on logout. */
export function logout(refresh: string) {
  return apiRequest<{ logged_out: boolean }>(apiClient.post('/auth/logout/', { refresh }));
}
