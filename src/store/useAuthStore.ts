import { create } from 'zustand';
import {
  AuthCredentials,
  clearAuthCredentials,
  getAuthCredentials,
  saveAuthCredentials,
} from '../services/secureStorage';

export interface AuthState {
  nik: string | null;
  token: string | null;
  reporterName: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  hydrateAuth: () => Promise<void>;
  saveCredentials: (credentials: AuthCredentials) => Promise<void>;
  clearCredentials: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  nik: null,
  token: null,
  reporterName: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrateAuth: async () => {
    try {
      const { nik, token, reporterName } = await getAuthCredentials();
      const isAuthenticated = Boolean(nik && token && reporterName);

      set({
        nik,
        token,
        reporterName,
        isAuthenticated,
        isHydrated: true,
      });
    } catch {
      set({
        nik: null,
        token: null,
        reporterName: null,
        isAuthenticated: false,
        isHydrated: true,
      });
    }
  },

  saveCredentials: async (credentials: AuthCredentials) => {
    await saveAuthCredentials(credentials);

    set({
      nik: credentials.nik,
      token: credentials.token,
      reporterName: credentials.reporterName,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  clearCredentials: async () => {
    await clearAuthCredentials();

    set({
      nik: null,
      token: null,
      reporterName: null,
      isAuthenticated: false,
      isHydrated: true,
    });
  },
}));
