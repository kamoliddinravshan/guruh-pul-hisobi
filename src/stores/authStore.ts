import { create } from 'zustand';
import type { User } from '@/shared/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (payload: { user?: User | null; access: string; refresh: string }) => void;
  setUser: (user: User | null) => void;
  clearSession: () => void;
}

/** Global authentication slice for SimpleJWT tokens and current user. */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  setSession: ({ user, access, refresh }) => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    set({ user: user || null, accessToken: access, refreshToken: refresh });
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));
