import { useEffect, useState } from 'react';
import { fetchTasks, fetchUser, fetchReferralSummary, fetchWithdrawals } from '../services/api';
import PageShell from '../ui/PageShell';

export default function HomePage() {
  const [balance, setBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [referralSummary, setReferralSummary] = useState<any>({ currentLevel: 0, referredEarnings: 0, rewardPointsEarned: 0, nextLevelProgress: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchUser().then(res => {
        setBalance(res.data.user.balance || 0);
        setPoints(res.data.user.points || 0);
      }),
      fetchTasks().then(res => setTasks(res.data.tasks || [])).catch(() => setError('Unable to load tasks.')),
      fetchReferralSummary().then(res => setReferralSummary(res.data)).catch(() => setError('Unable to load referral summary.')),
      fetchWithdrawals().then(res => setWithdrawals(res.data.withdrawals || [])).catch(() => setError('Unable to load withdrawals.')),
    ])
      .catch(() => setError('Unable to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell title="Dashboard" subtitle="Your premium control center for rewards and referrals.">
      <div className="wallet-summary card">
        <div className="stat-card">
          <span>Points</span>
          <strong>{points}</strong>
        </div>
        <div className="stat-card">
          <span>Available Balance</span>
          <strong>{balance.toFixed(2)}</strong>
        </div>
        <div className="stat-card">
          <span>Referral Level</span>
          <strong>{referralSummary.currentLevel || 0}</strong>
        </div>
      </div>

      <div className="card section-card">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button type="button" className="chip" onClick={() => window.location.hash = '/tasks'}>Browse Tasks</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/wallet'}>Request Withdrawal</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/invite'}>Invite Friends</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/settings'}>Settings</button>
        </div>
      </div>

      <div className="card section-card">
        <h2>Referral Summary</h2>
        <div className="metric-grid">
          <div className="metric-card">
            <span>Level</span>
            <strong>{referralSummary.currentLevel || 0}</strong>
          </div>
          <div className="metric-card">
            <span>Earned</span>
            <strong>{referralSummary.referredEarnings?.toFixed(2) || '0.00'} points</strong>
          </div>
          <div className="metric-card">
            <span>Reward Points</span>
            <strong>{referralSummary.rewardPointsEarned || 0}</strong>
          </div>
        </div>
        <div className="progress-block">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(referralSummary.nextLevelProgress || 0) * 100}%` }} />
          </div>
          <p className="small-text">Invite your friend and earn a reward for every level they complete.</p>
        </div>
      </div>

      <div className="card section-card">
        <h2>Recent Withdrawals</h2>
        {loading ? (
          <div className="empty-state">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="empty-state">No withdrawal history yet.</div>
        ) : (
          withdrawals.slice(0, 3).map(w => (
            <div key={w.id} className="history-item">
              <div className="history-left">
                <strong>{w.payoutMethod.toUpperCase()}</strong>
                <div className="small-text">{w.status}</div>
              </div>
              <div className="history-right">
                <span className="amount">{w.amount.toFixed(2)} points</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card section-card">
        <h2>Available Task Access</h2>
        <div className="action-grid">
          <button type="button" className="chip" onClick={() => window.location.hash = '/tasks'}>Ads</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/tasks'}>Easy</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/tasks'}>Medium</button>
          <button type="button" className="chip" onClick={() => window.location.hash = '/tasks'}>Long</button>
        </div>
      </div>
      {error && <div className="message error">{error}</div>}
    </PageShell>
  );
}
