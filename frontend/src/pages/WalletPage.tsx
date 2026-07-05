import { useEffect, useState } from 'react';
import { fetchWithdrawals, fetchUser, requestWithdrawal } from '../services/api';
import PageShell from '../ui/PageShell';

type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

type Withdrawal = {
  id: string;
  amount: number;
  payoutMethod: string;
  accountDetails: string;
  status: WithdrawalStatus;
  requestedAt?: string;
  approvedAt?: string | null;
  approvedByAdminId?: string | null;
};

export default function WalletPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);
  const [points, setPoints] = useState(0);
  const [amount, setAmount] = useState(0);
  const [accountDetails, setAccountDetails] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('paypal');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchUser(), fetchWithdrawals()])
      .then(([userRes, withdrawalsRes]) => {
        setBalance(userRes.data.user?.balance ?? 0);
        setPoints(userRes.data.user?.points ?? 0);
        setWithdrawals(withdrawalsRes.data.withdrawals ?? []);
      })
      .catch(() => setError('Unable to load wallet.'))
      .finally(() => setLoading(false));
  }, []);

  const handleRequest = async () => {
    setMessage('');
    setError('');

    const requestedAmount = Number(amount);
    if (!requestedAmount || requestedAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }
    if (!accountDetails.trim()) {
      setError('Enter your payout account details.');
      return;
    }
    if (requestedAmount > balance) {
      setError('Amount exceeds your available balance.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await requestWithdrawal({ amount: requestedAmount, payoutMethod, accountDetails });
      setWithdrawals(prev => [response.data.withdrawal, ...prev]);
      setMessage('Withdrawal requested. Admin will review it soon.');
      setAmount(0);
      setAccountDetails('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to request withdrawal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell title="Wallet">
      <div className="wallet-summary card">
        <div>
          <p className="label">Available Points</p>
          <h2>{balance.toFixed(2)}</h2>
        </div>
        <div>
          <p className="label">Total Points</p>
          <h2>{points}</h2>
        </div>
      </div>

      <div className="card section-card">
        <h2>Request Withdrawal</h2>
        <p className="subtitle">Choose your payout method and submit your withdrawal request.</p>
        <label>Payout Method</label>
        <select value={payoutMethod} onChange={e => setPayoutMethod(e.target.value)}>
          <option value="paypal">PayPal</option>
          <option value="bank">Bank Transfer</option>
          <option value="crypto">Crypto Wallet</option>
        </select>

        <label>Account Details</label>
        <input
          type="text"
          value={accountDetails}
          onChange={e => setAccountDetails(e.target.value)}
          placeholder={
            payoutMethod === 'paypal'
              ? 'Enter PayPal email address'
              : payoutMethod === 'bank'
              ? 'Enter bank account details'
              : 'Enter crypto wallet address'
          }
        />

        <label>Amount</label>
        <input
          type="number"
          min="1"
          step="0.01"
          value={amount || ''}
          onChange={e => setAmount(Number(e.target.value))}
          placeholder="Enter requested points"
        />

        <button className="primary-button" onClick={handleRequest} disabled={submitting || loading}>
          {submitting ? 'Submitting…' : 'Submit Withdrawal'}
        </button>
      </div>

      {message && <div className="message hint">{message}</div>}
      {error && <div className="message error">{error}</div>}

      <div className="card section-card">
        <h2>Withdrawal History</h2>
        {loading ? (
          <div className="empty-state">Loading withdrawals...</div>
        ) : withdrawals.length === 0 ? (
          <div className="empty-state">No withdrawals yet.</div>
        ) : (
          withdrawals.map((w: Withdrawal) => (
            <div key={w.id} className="history-item">
              <div>
                <strong>{w.payoutMethod.toUpperCase()}</strong>
                <div className="small-text">{w.accountDetails || 'No account details provided'}</div>
              </div>
              <div className="history-right">
                <span className={`status ${w.status}`}>{w.status}</span>
                <span className="amount">{w.amount.toFixed(2)} points</span>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
}