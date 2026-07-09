import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. تحقق من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-center">
      <div className="card auth-card">
        <div className="brand-crest" style={{ margin: '0 auto 18px' }}>S</div>
        <h2 style={{ textAlign: 'center', color: 'var(--text)', margin: '0 0 8px' }}>تسجيل الدخول</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '0 0 20px', fontSize: '0.95rem' }}>
          مرحباً بعودتك
        </p>
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '4px' }}>
            <label className="label">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>
          <div style={{ marginBottom: '4px' }}>
            <label className="label">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="أدخل كلمة المرور"
            />
          </div>
          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;