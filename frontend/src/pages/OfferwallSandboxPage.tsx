import { useEffect, useState } from 'react';
import PageShell from '../ui/PageShell';

type OfferwallEvent = {
  type: string;
  payload?: Record<string, any>;
};

export default function OfferwallSandboxPage() {
  const [mode, setMode] = useState('sandbox');
  const [userId, setUserId] = useState('testuser123');
  const [transactionId, setTransactionId] = useState('');
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [hasOpener, setHasOpener] = useState(true);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerCompleted, setOfferCompleted] = useState(false);
  const [rewardSent, setRewardSent] = useState(false);

  const appendLog = (message: string) => {
    setLogEntries(prev => [`${new Date().toISOString()} — ${message}`, ...prev].slice(0, 50));
    console.log(message);
  };

  const sendEvent = (event: OfferwallEvent) => {
    if (!window.opener || window.opener.closed) {
      appendLog('ERROR: No opener window detected. The app flow cannot receive events.');
      setHasOpener(false);
      return;
    }
    window.opener.postMessage(event, window.origin);
  };

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const queryUserId = search.get('userId') || 'testuser123';
    const queryMode = search.get('mode') || 'sandbox';
    const queryTransactionId = search.get('transactionId') || `tx-${Date.now()}`;
    setUserId(queryUserId);
    setMode(queryMode);
    setTransactionId(queryTransactionId);

    const initPayload = {
      type: 'offerwall:init_success',
      payload: {
        userId: queryUserId,
        mode: queryMode,
        transactionId: queryTransactionId,
      },
    };

    if (queryMode !== 'sandbox') {
      appendLog('ERROR: Offerwall loaded outside sandbox mode.');
      sendEvent({ type: 'offerwall:error', payload: { message: 'Offerwall not running in sandbox mode.', userId: queryUserId, mode: queryMode } });
    }

    if (!window.opener) {
      appendLog('WARNING: No opener detected. This page was opened directly, not from the app sandbox test page.');
      setHasOpener(false);
      return;
    }

    sendEvent(initPayload);
    appendLog(`Initialization success event sent for userId=${queryUserId}, mode=${queryMode}, transactionId=${queryTransactionId}.`);
  }, []);

  const handleOpenOffer = () => {
    sendEvent({
      type: 'offerwall:offer_opened',
      payload: { userId, mode, transactionId, offerId: 'sandbox-offer-001' },
    });
    appendLog('Offer opened event sent.');
    setOfferOpen(true);
  };

  const handleCompleteOffer = () => {
    if (!offerOpen) {
      appendLog('ERROR: Cannot complete offer before opening it.');
      sendEvent({ type: 'offerwall:error', payload: { message: 'Offer must be opened before it can complete.' } });
      return;
    }
    sendEvent({
      type: 'offerwall:offer_completed',
      payload: { userId, mode, transactionId, offerId: 'sandbox-offer-001', completedAt: new Date().toISOString() },
    });
    appendLog('Offer completed event sent.');
    setOfferCompleted(true);
  };

  const handleReward = () => {
    if (!offerCompleted) {
      appendLog('ERROR: Reward should only be sent after offer completion.');
      sendEvent({ type: 'offerwall:error', payload: { message: 'Offer is not completed yet.' } });
      return;
    }
    if (rewardSent) {
      appendLog(`Duplicate reward simulation sent for transactionId=${transactionId}.`);
    }
    sendEvent({
      type: 'offerwall:reward_received',
      payload: {
        userId,
        mode,
        transactionId,
        offerId: 'sandbox-offer-001',
        rewardPoints: 50,
        rewardBalance: 0,
      },
    });
    appendLog(`Reward received event sent for transactionId=${transactionId}.`);
    setRewardSent(true);
  };

  const handleCallback = () => {
    sendEvent({
      type: 'offerwall:callback_received',
      payload: {
        userId,
        mode,
        transactionId,
        eventType: 'sandbox_offer_event',
        source: 'sandbox-offerwall',
      },
    });
    appendLog('Callback received event sent to app.');
  };

  const handleClose = () => {
    sendEvent({
      type: 'offerwall:closed',
      payload: { userId, mode, transactionId },
    });
    appendLog('Offerwall closed event sent to app. Returning flow to app.');
    window.close();
  };

  const handleError = () => {
    sendEvent({
      type: 'offerwall:error',
      payload: { message: 'Sandbox offerwall forced error for validation.', userId, mode, transactionId },
    });
    appendLog('Error event sent.');
  };

  return (
    <PageShell title="Sandbox Offerwall" subtitle="Simulated offerwall for app integration testing.">
      <div className="card section-card">
        <p>This sandbox offerwall is only for test validation. It does not award production rewards.</p>
        <p><strong>Mode:</strong> {mode}</p>
        <p><strong>Test user ID:</strong> {userId}</p>
        <p><strong>Transaction ID:</strong> {transactionId}</p>
        <p><strong>Opener connected:</strong> {hasOpener ? 'Yes' : 'No'}</p>
      </div>
      <div className="card section-card">
        <h2>Sandbox Offer Actions</h2>
        <button type="button" className="primary-button" onClick={handleOpenOffer}>Send Open Offer</button>
        <button type="button" className="primary-button" onClick={handleCompleteOffer}>Send Offer Completed</button>
        <button type="button" className="primary-button" onClick={handleReward}>Send Reward Received</button>
        <button type="button" className="secondary-button" onClick={handleCallback}>Send Callback Received</button>
        <button type="button" className="secondary-button" onClick={handleError}>Send Error Event</button>
        <button type="button" className="secondary-button" onClick={handleClose}>Close Offerwall</button>
      </div>
      <div className="card section-card">
        <h2>Event Log</h2>
        {logEntries.length === 0 ? (
          <div className="empty-state">No sandbox events yet.</div>
        ) : (
          <div className="event-log">
            {logEntries.map((entry, index) => (
              <div key={`${entry}-${index}`} className="event-log-item">{entry}</div>
            ))}
          </div>
        )}
      </div>
      <div className="card section-card">
        <button type="button" className="secondary-button" onClick={() => window.location.hash = '/offerwall-test'}>Back to Sandbox Test Page</button>
      </div>
    </PageShell>
  );
}
