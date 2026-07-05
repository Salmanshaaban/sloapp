import { useEffect, useState } from 'react';
import { fetchAdminDashboard, adminDecision, adminUserAction } from '../services/api';
import PageShell from '../ui/PageShell';

const tabs = ['overview', 'users', 'withdrawals', 'providers', 'logs', 'settings'];

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>({ users: [], withdrawals: [], referrals: [], tasks: [], providers: [], categories: [], settings: [], activityLogs: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdminDashboard()
      .then(res => setData(res.data))
      .catch(() => setMessage('Unable to load admin dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDecision = async (id: string, decision: string) => {
    try {
      await adminDecision(id, decision);
      setData((prev: any) => ({
        ...prev,
        withdrawals: prev.withdrawals.map((w: any) => (w.id === id ? { ...w, status: decision } : w)),
      }));
    } catch {
      setMessage('Unable to update withdrawal decision.');
    }
  };

  const handleUserAction = async (userId: string, actionType: string) => {
    try {
      await adminUserAction(userId, actionType);
      setData((prev: any) => ({
        ...prev,
        users: prev.users.map((user: any) => {
          if (user.id !== userId) return user;
          return {
            ...user,
            status: actionType === 'ban_user' ? 'banned' : actionType === 'suspend_user' ? 'suspended' : 'active',
          };
        }),
      }));
    } catch {
      setMessage('Unable to apply user action.');
    }
  };

  return (
    <PageShell title="Admin Dashboard" subtitle="Manage users, withdrawals, providers, and audit logs.">
      <div className="card section-card">
        <div className="action-grid">
          {tabs.map(tab => (
            <button key={tab} type="button" className={`tab-pill ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading admin dashboard...</div>
      ) : activeTab === 'overview' && (
        <>
          <div className="card section-card admin-grid">
            <div className="stat-card">
              <span>Users</span>
              <strong>{data.users.length}</strong>
            </div>
            <div className="stat-card">
              <span>Withdrawals</span>
              <strong>{data.withdrawals.length}</strong>
            </div>
            <div className="stat-card">
              <span>Tasks</span>
              <strong>{data.tasks.length}</strong>
            </div>
          </div>
          <div className="card section-card">
            <h2>Recent Activity</h2>
            {data.activityLogs.slice(0, 5).map((log: any) => (
              <div key={log.id} className="log-item">
                <div className="log-left">
                  <strong>{log.type}</strong>
                  <div className="log-meta">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
                <div>{log.details ? JSON.stringify(log.details) : 'No details'}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card section-card">
          <h2>Users</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                  <td>
                    <button type="button" className="table-action" onClick={() => handleUserAction(user.id, 'suspend_user')}>
                      Suspend
                    </button>
                    <button type="button" className="table-action" onClick={() => handleUserAction(user.id, 'ban_user')}>
                      Ban
                    </button>
                    <button type="button" className="table-action" onClick={() => handleUserAction(user.id, 'restore_user')}>
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="card section-card">
          <h2>Withdrawals</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.withdrawals.map((w: any) => (
                <tr key={w.id}>
                  <td>{w.userId}</td>
                  <td>{w.amount.toFixed(2)} points</td>
                  <td>{w.status}</td>
                  <td>
                    <button type="button" className="table-action approve" onClick={() => handleDecision(w.id, 'approved')}>
                      Approve
                    </button>
                    <button type="button" className="table-action reject" onClick={() => handleDecision(w.id, 'rejected')}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="card section-card">
          <h2>Task Providers</h2>
          <div className="provider-grid">
            {data.providers.map((provider: any) => (
              <div key={provider.id} className="provider-card">
                <div className="provider-left">
                  <strong className="provider-title">{provider.name}</strong>
                  <div className="provider-meta">Status: {provider.status}</div>
                  <div className="provider-meta">Geo: {provider.geoRestrictions?.join(', ')}</div>
                </div>
                <button type="button" className="secondary-button">Review</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card section-card">
          <h2>Audit Logs</h2>
          {data.activityLogs.length === 0 ? (
            <div className="empty-state">No logs available.</div>
          ) : (
            data.activityLogs.map((log: any) => (
              <div key={log.id} className="log-item">
                <div className="log-left">
                  <strong>{log.type}</strong>
                  <div className="log-meta">{new Date(log.createdAt).toLocaleString()}</div>
                </div>
                <div>{log.details ? JSON.stringify(log.details) : '-'}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card section-card">
          <h2>App Settings</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {data.settings.map((setting: any) => (
                <tr key={setting.id}>
                  <td>{setting.key}</td>
                  <td>{setting.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {message && <div className="message error">{message}</div>}
    </PageShell>
  );
}
