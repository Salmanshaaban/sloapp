import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <div className="top-bar">
        <h1>لوحة التحكم</h1>
        <div className="nav-links">
          <a href="/dashboard">الرئيسية</a>
        </div>
      </div>

      <div className="card section-card">
        <h2>مرحباً، {user?.name || 'مستخدم'}</h2>
        <div className="wallet-summary" style={{ marginTop: '16px' }}>
          <div className="stat-card">
            <span className="label">البريد الإلكتروني</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="stat-card">
            <span className="label">الدور</span>
            <strong>{isAdmin ? 'مدير' : 'مستخدم'}</strong>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card section-card" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
          <h2>🔐 لوحة تحكم المدير</h2>
          <p style={{ color: 'var(--text-muted)' }}>هذه الصفحة خاصة بالمدير فقط.</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="secondary-button"
        style={{ marginTop: '20px' }}
      >
        تسجيل الخروج
      </button>
    </div>
  );
};

export default Dashboard;