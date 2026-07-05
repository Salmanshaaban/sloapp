import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../state';
import { logout } from '../services/api';
import PageShell from '../ui/PageShell';
import { t } from '../i18n';

export default function SettingsPage() {
  const { theme, setTheme, setAuthToken, setIsAdmin, language, setLanguage } = useContext(AppContext);
  const [notifications, setNotifications] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const translate = (key: string) => t(language, key);

  const handleLogout = () => {
    logout();
    setAuthToken(null);
    setIsAdmin(false);
    localStorage.removeItem('saloToken');
    navigate('/login');
  };

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('saloTheme', nextTheme);
  };

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    setLanguage(lang);
    localStorage.setItem('saloLanguage', lang);
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage(translate('passwordNotConfigured'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setMessage('Password change is not enabled in demo mode.');
  };

  return (
    <PageShell title={translate('settingsTitle')} subtitle={translate('settingsSubtitle')}>
      <div className="card section-card">
        <h2>{translate('appInfo')}</h2>
        <p>{translate('settingsSubtitle')}</p>
      </div>
      <div className="card section-card">
        <h2>{translate('preferences')}</h2>
        <div className="setting-item">
          <span>{translate('language')}</span>
          <div className="button-row">
            <button type="button" className={`tab-pill ${language === 'en' ? 'active' : ''}`} onClick={() => handleLanguageChange('en')}>
              {translate('english')}
            </button>
            <button type="button" className={`tab-pill ${language === 'ar' ? 'active' : ''}`} onClick={() => handleLanguageChange('ar')}>
              {translate('arabic')}
            </button>
          </div>
        </div>
        <div className="setting-item">
          <span>{translate('theme')}</span>
          <button className="secondary-button" type="button" onClick={handleThemeToggle}>
            {theme === 'dark' ? translate('switchToLight') : translate('switchToDark')}
          </button>
        </div>
        <div className="setting-item">
          <span>{translate('notifications')}</span>
          <button className="secondary-button" type="button" onClick={() => setNotifications(prev => !prev)}>
            {notifications ? 'Disable' : 'Enable'} {translate('notifications')}
          </button>
        </div>
      </div>
      <div className="card section-card">
        <h2>{translate('security')}</h2>
        <button type="button" className="secondary-button" onClick={() => setShowPasswordForm(prev => !prev)}>
          {translate('changePassword')}
        </button>
        {showPasswordForm && (
          <form className="settings-form" onSubmit={handlePasswordSubmit}>
            <label>{translate('currentPassword')}</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            <label>{translate('newPassword')}</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            <label>{translate('confirmPassword')}</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button type="submit" className="primary-button">{translate('save')}</button>
            <p className="small-text">{translate('passwordNotConfigured')}</p>
          </form>
        )}
        <button type="button" className="secondary-button" onClick={() => setShowTwoFactor(prev => !prev)}>
          {translate('twoFactor')}
        </button>
        {showTwoFactor && (
          <div className="settings-form">
            <p>{translate('twoFactorNotConfigured')}</p>
            <button type="button" className="primary-button">Enable 2FA</button>
          </div>
        )}
      </div>
      <div className="card section-card">
        <h2>{translate('account')}</h2>
        <button type="button" className="secondary-button" onClick={handleLogout}>
          {translate('logout')}
        </button>
      </div>
      {message && <div className="message error">{message}</div>}
    </PageShell>
  );
}
