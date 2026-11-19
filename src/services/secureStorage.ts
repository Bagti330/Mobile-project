import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const SECURE_STORAGE_KEYS = {
  TOKEN: 'civic_pulse_auth_token',
  NIK: 'civic_pulse_reporter_nik',
  REPORTER_NAME: 'civic_pulse_reporter_name',
} as const;

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];

export interface AuthCredentials {
  nik: string;
  token: string;
  reporterName: string;
}

export interface StoredAuthCredentials {
  nik: string | null;
  token: string | null;
  reporterName: string | null;
}

const isWebStorageAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

export const setSecureItem = async (key: SecureStorageKey, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    if (isWebStorageAvailable()) {
      window.localStorage.setItem(key, value);
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

export const getSecureItem = async (key: SecureStorageKey): Promise<string | null> => {
  if (Platform.OS === 'web') {
    if (isWebStorageAvailable()) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  return SecureStore.getItemAsync(key);
};

export const deleteSecureItem = async (key: SecureStorageKey): Promise<void> => {
  if (Platform.OS === 'web') {
    if (isWebStorageAvailable()) {
      window.localStorage.removeItem(key);
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const saveAuthCredentials = async (credentials: AuthCredentials): Promise<void> => {
  await Promise.all([
    setSecureItem(SECURE_STORAGE_KEYS.NIK, credentials.nik),
    setSecureItem(SECURE_STORAGE_KEYS.TOKEN, credentials.token),
    setSecureItem(SECURE_STORAGE_KEYS.REPORTER_NAME, credentials.reporterName),
  ]);
};

export const getAuthCredentials = async (): Promise<StoredAuthCredentials> => {
  const [nik, token, reporterName] = await Promise.all([
    getSecureItem(SECURE_STORAGE_KEYS.NIK),
    getSecureItem(SECURE_STORAGE_KEYS.TOKEN),
    getSecureItem(SECURE_STORAGE_KEYS.REPORTER_NAME),
  ]);

  return {
    nik,
    token,
    reporterName,
  };
};

export const clearAuthCredentials = async (): Promise<void> => {
  await Promise.all([
    deleteSecureItem(SECURE_STORAGE_KEYS.NIK),
    deleteSecureItem(SECURE_STORAGE_KEYS.TOKEN),
    deleteSecureItem(SECURE_STORAGE_KEYS.REPORTER_NAME),
  ]);
};
