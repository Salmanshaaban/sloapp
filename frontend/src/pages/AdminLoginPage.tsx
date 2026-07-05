import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../state';
import { adminLogin, setToken } from '../services/api';
import PageShell from '../ui/PageShell';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setAuthToken, setIsAdmin } = useContext(AppContext);
  const [email, setEmail] = useState('admin@salo.app');
  const [password, setPassword] = useState('Admin@123');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    const deviceId = navigator.userAgent || 'unknown-device';
    const fingerprint = navigator.platform || 'unknown-fingerprint';
    try {
      const response = await adminLogin({ email, password, deviceId, fingerprint });
      const token = response.data.token;
      setToken(token);
      setAuthToken(token);
      setIsAdmin(true);
      localStorage.setItem('saloToken', token);
      navigate('/admin/dashboard');
    } catch {
      setMessage('Failed to sign in.');
    }
  };

  return (
    <PageShell title="Admin Access" subtitle="Secure admin access for Salo operations.">
      <div className="card auth-card">
        <h2>Admin Panel</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="primary-button">Sign In</button>
        </form>
        <div className="action-grid">
          <button type="button" className="secondary-button">Fingerprint Ready</button>
          <button type="button" className="secondary-button">2FA Ready</button>
        </div>
        {message && <div className="message error">{message}</div>}
      </div>
    </PageShell>
  );
}
