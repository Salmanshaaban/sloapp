import { useEffect, useMemo, useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import TasksPage from './pages/TasksPage';
import WalletPage from './pages/WalletPage';
import SettingsPage from './pages/SettingsPage';
import InvitePage from './pages/InvitePage';
import OfferwallTestPage from './pages/OfferwallTestPage';
import OfferwallSandboxPage from './pages/OfferwallSandboxPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import { AppContext, initialAppState } from './state';
import { fetchUser, setToken } from './services/api';
import { LanguageCode } from './i18n';

function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function AppRoutes() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [route, setRoute] = useState(() => window.location.hash.replace('#', '') || '/login');

  useEffect(() => {
    const storedToken = localStorage.getItem('saloToken');
    const storedTheme = localStorage.getItem('saloTheme') as 'dark' | 'light' | null;
    const storedLanguage = localStorage.getItem('saloLanguage') as LanguageCode | null;

    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    }

    if (storedLanguage === 'ar' || storedLanguage === 'en') {
      setLanguage(storedLanguage);
    }

    if (storedToken) {
      setAuthToken(storedToken);
      setToken(storedToken);
      const payload = parseJwt(storedToken);
      setIsAdmin(Boolean(payload?.isAdmin));
      fetchUser().catch(() => {
        setAuthToken(null);
        setToken(null);
        localStorage.removeItem('saloToken');
      });
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [theme, language]);

  useEffect(() => {
    localStorage.setItem('saloTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('saloLanguage', language);
  }, [language]);

  useEffect(() => {
    const handler = (event: any) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.replace('#', '') || '/login');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const contextValue = useMemo(
    () => ({
      ...initialAppState,
      theme,
      setTheme,
      language,
      setLanguage,
      authToken,
      setAuthToken,
      isAdmin,
      setIsAdmin,
      installPrompt,
      setInstallPrompt,
    }),
    [theme, language, authToken, isAdmin, installPrompt]
  );

  const renderPage = () => {
    const protectedPage = (page: JSX.Element) => authToken ? page : <LoginPage />;
    const adminPage = (page: JSX.Element) => authToken && isAdmin ? page : <AdminLoginPage />;

    switch (route) {
      case '/home':
        return protectedPage(<HomePage />);
      case '/tasks':
        return protectedPage(<TasksPage />);
      case '/wallet':
        return protectedPage(<WalletPage />);
      case '/invite':
        return protectedPage(<InvitePage />);
      case '/settings':
        return protectedPage(<SettingsPage />);
      case '/offerwall-test':
        return protectedPage(<OfferwallTestPage />);
      case '/offerwall-sandbox':
        return protectedPage(<OfferwallSandboxPage />);
      case '/admin/dashboard':
        return adminPage(<AdminDashboardPage />);
      case '/admin/login':
        return <AdminLoginPage />;
      case '/login':
      default:
        return <LoginPage />;
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {renderPage()}
    </AppContext.Provider>
  );
}

export default function App() {
  return <AppRoutes />;
}
