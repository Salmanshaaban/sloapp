import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px' }}>
      <h1>مرحباً، {user?.name || 'مستخدم'}</h1>
      <p>البريد الإلكتروني: {user?.email}</p>
      <p>الدور: {isAdmin ? 'مدير' : 'مستخدم'}</p>
      
      {isAdmin && (
        <div style={{ marginTop: '20px', padding: '15px', border: '2px solid green', borderRadius: '8px' }}>
          <h3>🔐 لوحة تحكم المدير</h3>
          <p>هذه الصفحة خاصة بالمدير فقط.</p>
        </div>
      )}

      <button
        onClick={logout}
        style={{
          marginTop: '30px',
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        تسجيل الخروج
      </button>
    </div>
  );
};

export default Dashboard;