import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../state';
import { login, signup, setToken } from '../services/api';
import { googleSignIn } from '../services/googleSignIn';
import GoogleSignInButton from '../components/GoogleSignInButton';

import { t, type LanguageCode } from '../i18n';

type GoogleCredentialPayload = {
  email?: string;
  name?: string;
  sub?: string; // googleId
};

function decodeGoogleCredential(credential: string): GoogleCredentialPayload | null {
  try {
    const payload = credential.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function handleGoogleCredential(credential: string, opts: {
  deviceId: string;
  fingerprint: string;
  completeAuth: (token: string) => void;
  setMessage: (msg: string) => void;
}) {
  const { email, name, sub } = decodeGoogleCredential(credential) || {};
  if (!email || !sub) {
    opts.setMessage('Google login failed. Missing email/googleId.');
    return;
  }

  try {
    const response = await googleSignIn({
      email,
      name,
      googleId: sub,
      deviceId: opts.deviceId,
      fingerprint: opts.fingerprint,
    });
    opts.completeAuth(response.data.token);
  } catch (e) {
    opts.setMessage('Google login failed.');
  }
}





function parseJwt(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { installPrompt, setInstallPrompt, setAuthToken, setIsAdmin, authToken, language } = useContext(AppContext);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const deviceId = navigator.userAgent || 'unknown-device';
  const fingerprint = navigator.platform || 'unknown-fingerprint';

  useEffect(() => {
    if (authToken) navigate('/home');
  }, [authToken, navigate]);

  const completeAuth = (token: string) => {
    setToken(token);
    setAuthToken(token);
    setIsAdmin(false);
    localStorage.setItem('saloToken', token);
    navigate('/home');
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      const response = await login({ email, password, deviceId, fingerprint });
      completeAuth(response.data.token);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Unable to sign in.');
    }
  };

  const handleSignup = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await signup({ email, password, name, deviceId, fingerprint });
      completeAuth(response.data.token);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Unable to create account.');
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const lang = (language as LanguageCode) || 'en';

  return (
    <div className="page page-center">
      <div className="card auth-card" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="brand-crest">S</div>
        <h1>{t(lang, 'welcome')}</h1>
        <p className="subtitle">{t(lang, 'subtitle')}</p>

        <form onSubmit={handleLogin}>
          <label>{t(lang, 'email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label>{t(lang, 'password')}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder={t(lang, 'password')}
          />

          <button type="submit" className="primary-button">
            {t(lang, 'login')}
          </button>

          <div style={{ height: 10 }} />

          <button type="button" className="secondary-button" onClick={handleSignup}>
            {t(lang, 'createAccount')}
          </button>

          {/* Show name only when creating an account (simple progressive enhancement) */}
          <div style={{ marginTop: 10 }} />
          <label>{t(lang, 'name')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t(lang, 'name')}
          />
        </form>

        <GoogleSignInButton
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          onGoogleCredential={(credential) =>
            handleGoogleCredential(credential, {
              deviceId,
              fingerprint,
              completeAuth,
              setMessage,
            })
          }
        />

        {installPrompt && (

          <div className="action-grid" style={{ gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="chip" onClick={handleInstall}>
              تثبيت التطبيق
            </button>
          </div>
        )}

        {message && <div className="message error" style={{ marginTop: '1rem' }}>{message}</div>}
      </div>
    </div>
  );
}

