import { createContext } from 'react';

export const initialAppState = {
  theme: 'light' as 'dark' | 'light',
  setTheme: (_theme: 'dark' | 'light') => {},
  language: 'en' as 'en' | 'ar',
  setLanguage: (_language: 'en' | 'ar') => {},
  authToken: null as string | null,
  setAuthToken: (_token: string | null) => {},
  isAdmin: false,
  setIsAdmin: (_value: boolean) => {},
  installPrompt: null as BeforeInstallPromptEvent | null,
  setInstallPrompt: (_event: BeforeInstallPromptEvent | null) => {},
};

export const AppContext = createContext(initialAppState);
