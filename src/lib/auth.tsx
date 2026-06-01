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
      token: auth?.access || null,
      isAuthenticated: Boolean(auth?.access),
      login: async (email, password) => {
        const tokens = await apiRequest<{ access: string; refresh: string }>('/auth/login/', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        localStorage.setItem(AUTH_KEY, JSON.stringify({ ...tokens, user: null }));
        const user = await apiRequest<{ id: string; email: string; full_name: string; avatar?: string | null }>('/auth/me/');
        persistAuth({
          ...tokens,
          user: { id: user.id, email: user.email, name: user.full_name, avatarUrl: user.avatar || null },
        });
      },
      register: async (name, email, password) => {
        const nextAuth = await apiRequest<{ access: string; refresh: string; user: { id: string; email: string; full_name: string; avatar?: string | null } }>('/auth/register/', {
          method: 'POST',
          body: JSON.stringify({ full_name: name, email, password, password2: password }),
        });
        persistAuth({
          access: nextAuth.access,
          refresh: nextAuth.refresh,
          user: {
            id: nextAuth.user.id,
            email: nextAuth.user.email,
            name: nextAuth.user.full_name,
            avatarUrl: nextAuth.user.avatar || null,
          },
        });
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
