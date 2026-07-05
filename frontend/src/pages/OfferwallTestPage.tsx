import { useEffect, useState } from 'react';
import PageShell from '../ui/PageShell';
import { awardSandboxOfferwallReward, fetchOfferwallSandboxConfig, fetchUser, logOfferwallSandboxCallback } from '../services/api';

type OfferwallEvent = {
  type: string;
  payload?: Record<string, any>;
};

export default function OfferwallTestPage() {
  const [events, setEvents] = useState<string[]>([]);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [testUserId, setTestUserId] = useState('');
  const [isOfferwallOpen, setIsOfferwallOpen] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [message, setMessage] = useState('');
  const [points, setPoints] = useState(0);
  const [balance, setBalance] = useState(0);
  const [pendingTransactionId, setPendingTransactionId] = useState('');
  const [processedTransactions, setProcessedTransactions] = useState<string[]>([]);

  const logEvent = (text: string) => {
    setEvents(prev => [`${new Date().toISOString()} - ${text}`, ...prev].slice(0, 50));
    console.log(text);
  };

  useEffect(() => {
    fetchUser()
      .then(res => {
        setPoints(res.data.user?.points ?? 0);
        setBalance(res.data.user?.balance ?? 0);
      })
      .catch(() => logEvent('Unable to load authenticated user account.'));

    fetchOfferwallSandboxConfig()
      .then(res => {
        setSandboxMode(res.data.sandboxMode === true);
        setTestUserId(res.data.testUserId || 'testuser123');
        logEvent('Sandbox configuration loaded.');
      })
      .catch(() => logEvent('Unable to load sandbox offerwall configuration.'));
  }, []);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent<OfferwallEvent>) => {
      if (event.origin !== window.origin) return;
      const data = event.data;
      if (!data || typeof data.type !== 'string') return;
      const payload = data.payload || {};

      switch (data.type) {
        case 'offerwall:init_success': {
          const userId = payload.userId;
          const mode = payload.mode;
          logEvent(`Initialization success received (userId=${userId}, mode=${mode}).`);
          if (userId !== testUserId) {
            logEvent(`ERROR: Wrong test user ID passed. Expected ${testUserId}, got ${userId}.`);
          }
          if (mode !== 'sandbox') {
            logEvent('ERROR: Offerwall did not open in sandbox mode.');
          }
          break;
        }
        case 'offerwall:offer_opened': {
          logEvent('Offer opened event received.');
          break;
        }
        case 'offerwall:offer_completed': {
          logEvent('Offer completed event received.');
          break;
        }
        case 'offerwall:reward_received': {
          const transactionId = payload.transactionId;
          const userId = payload.userId;
          const rewardPoints = payload.rewardPoints ?? 0;
          const rewardBalance = payload.rewardBalance ?? 0;
          logEvent(`Reward received event received (transactionId=${transactionId}, points=${rewardPoints}, balance=${rewardBalance}).`);
          if (userId !== testUserId) {
            logEvent(`ERROR: Reward event userId mismatch. Expected ${testUserId}, got ${userId}.`);
            break;
          }
          if (!transactionId) {
            logEvent('ERROR: Missing transactionId on reward event.');
            break;
          }
          if (processedTransactions.includes(transactionId)) {
            logEvent(`Duplicate reward detected and skipped for transaction ${transactionId}.`);
            break;
          }

          try {
            const response = await awardSandboxOfferwallReward({
              transactionId,
              offerId: payload.offerId || 'sandbox-offer-001',
              rewardPoints,
              rewardBalance,
              userId,
            });
            if (response.data.duplicate) {
              logEvent(`Duplicate reward prevented by backend for transaction ${transactionId}.`);
            } else {
              setProcessedTransactions(prev => [...prev, transactionId]);
              setPoints(response.data.points);
              setBalance(response.data.balance);
              logEvent(`Sandbox reward applied, new points=${response.data.points}, new balance=${response.data.balance}.`);
            }
          } catch (err: any) {
            logEvent(`ERROR: Failed to apply sandbox reward: ${err?.response?.data?.message || err.message || err}.`);
          }
          break;
        }
        case 'offerwall:callback_received': {
          const transactionId = payload.transactionId;
          const userId = payload.userId;
          const eventType = payload.eventType;
          logEvent(`Callback received from offerwall (eventType=${eventType}, transactionId=${transactionId}).`);
          try {
            await logOfferwallSandboxCallback({
              transactionId,
              eventType,
              userId,
              info: payload,
            });
            logEvent('Backend callback logging accepted.');
          } catch (err: any) {
            logEvent(`ERROR: Failed to log callback on backend: ${err?.response?.data?.message || err.message || err}.`);
          }
          break;
        }
        case 'offerwall:closed': {
          logEvent('Offerwall closed and flow returned to the app.');
          setIsOfferwallOpen(false);
          break;
        }
        case 'offerwall:error': {
          logEvent(`Error event from offerwall: ${payload.message || 'Unknown error'}.`);
          break;
        }
        default: {
          logEvent(`Unknown offerwall event type received: ${data.type}.`);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage as unknown as EventListener);
    return () => window.removeEventListener('message', handleMessage as unknown as EventListener);
  }, [processedTransactions, testUserId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (popupWindow && popupWindow.closed) {
        setIsOfferwallOpen(false);
        setPopupWindow(null);
        logEvent('Popup closed, returning to app.');
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [popupWindow]);

  const openOfferwall = () => {
    if (!sandboxMode) {
      setMessage('Sandbox mode not available. Ensure backend sandbox config is enabled.');
      return;
    }
    setMessage('');
    const transactionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `tx-${Date.now()}`;
    setPendingTransactionId(transactionId);
    const url = `${window.location.origin}/offerwall-sandbox?mode=sandbox&userId=${encodeURIComponent(testUserId)}&transactionId=${encodeURIComponent(transactionId)}`;
    const popup = window.open(url, 'sandboxOfferwall', 'width=420,height=760');
    if (!popup) {
      setMessage('Popup blocked. Allow popups to open the sandbox offerwall.');
      return;
    }
    setIsOfferwallOpen(true);
    setPopupWindow(popup);
    logEvent(`Opening sandbox offerwall with userId=${testUserId}, transactionId=${transactionId}.`);
  };

  const openOfferwallDirectly = () => {
    window.location.href = `/offerwall-sandbox?mode=sandbox&userId=${encodeURIComponent(testUserId)}&transactionId=${encodeURIComponent(`tx-${Date.now()}`)}`;
  };

  return (
    <PageShell title="Offerwall Sandbox Test" subtitle="Validate the app flow with a fixed sandbox offerwall and test user.">
      <div className="card section-card">
        <h2>Sandbox test settings</h2>
        <p>Sandbox mode: <strong>{sandboxMode ? 'Enabled' : 'Disabled'}</strong></p>
        <p>Sandbox user ID: <strong>{testUserId || 'unknown'}</strong></p>
        <p>Sandbox only: rewards are simulated and not production payouts.</p>
        <p>Current account points: <strong>{points}</strong>, balance: <strong>{balance.toFixed(2)} points</strong></p>
        <button className="primary-button" onClick={openOfferwall} disabled={isOfferwallOpen}>Open Sandbox Offerwall</button>
        <button className="secondary-button" onClick={openOfferwallDirectly} style={{ marginLeft: '1rem' }}>
          Open Directly
        </button>
        {message && <div className="message error">{message}</div>}
      </div>
      <div className="card section-card">
        <h2>Validation log</h2>
        <p className="small-text">Every sandbox event, callback, reward, and flow return is captured here.</p>
        {events.length === 0 ? (
          <div className="empty-state">No events yet. Open the sandbox offerwall to begin.</div>
        ) : (
          <div className="event-log">
            {events.map((eventText, index) => (
              <div key={`${eventText}-${index}`} className="event-log-item">
                {eventText}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card section-card">
        <h2>Test flow checklist</h2>
        <ul>
          <li>Correct sandbox user ID passed in initialization.</li>
          <li>Offer opened event received.</li>
          <li>Offer completed event received.</li>
          <li>Reward received event handled and verified.</li>
          <li>Callback received and logged by the app.</li>
          <li>Balance and points update correctly.</li>
          <li>No duplicate reward is allowed.</li>
          <li>Closing the offerwall returns flow to the app.</li>
        </ul>
      </div>
      <div className="card section-card">
        <button type="button" className="secondary-button" onClick={() => window.location.hash = '/home'}>Back to Dashboard</button>
      </div>
    </PageShell>
  );
}
