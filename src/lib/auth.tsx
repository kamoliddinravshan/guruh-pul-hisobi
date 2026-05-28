import { useMemo, useState, type ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { AUTH_KEY, AuthContext, type AuthContextValue, type AuthResponse } from '@/lib/auth-context';

function readStoredAuth(): AuthResponse | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => readStoredAuth());

  const persistAuth = (nextAuth: AuthResponse) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: Boolean(auth?.token),
      login: async (email, password) => {
        const nextAuth = await apiRequest<AuthResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        persistAuth(nextAuth);
      },
      register: async (name, email, password) => {
        const nextAuth = await apiRequest<AuthResponse>('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        persistAuth(nextAuth);
      },
      loginWithGoogle: async (credential) => {
        const nextAuth = await apiRequest<AuthResponse>('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ credential }),
        });
        persistAuth(nextAuth);
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY);
        setAuth(null);
      },
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
