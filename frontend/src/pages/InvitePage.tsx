import { useEffect, useState } from 'react';
import PageShell from '../ui/PageShell';
import { fetchReferralSummary } from '../services/api';

export default function InvitePage() {
  const [referralLink, setReferralLink] = useState('https://salo.app/referral');
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [milestoneText, setMilestoneText] = useState('0.00 / 5.00 points');
  const [message, setMessage] = useState('Invite your friend and earn a reward for every level they complete');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchReferralSummary()
      .then(res => {
        setReferralLink(res.data.referralLink);
        setProgress(res.data.nextLevelProgress || 0);
        setCurrentLevel(res.data.currentLevel || 0);
        setEarnedPoints(res.data.rewardPointsEarned || 0);
        setMilestoneText(res.data.currentMilestone || '0.00 / 5.00 points');
        setMessage(res.data.message || message);
      })
      .catch(() => {
        setMessage('Invite your friend and earn a reward for every level they complete');
      })
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PageShell title="Invite Your Friend" subtitle="Share the app and earn rewards for every referral level.">
      <div className="card section-card">
        <h2>Invite Your Friend</h2>
        <p className="subtitle">{message}</p>

        {loading ? (
          <div className="empty-state">Loading referral summary...</div>
        ) : (
          <>
            <div className="referral-card">
              <div className="referral-link">{referralLink}</div>
              <div className="referral-actions">
            <button className="primary-button" type="button" onClick={copyLink}>
              {copied ? 'Copied' : 'Copy Link'}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() =>
                navigator.share?.({
                  title: 'Join Salo',
                  text: 'Earn rewards with Salo and complete levels together.',
                  url: referralLink,
                })
              }
            >
              Share
            </button>
          </div>
            </div>

            <div className="metric-grid">
          <div className="metric-card">
            <span>Current Level</span>
            <strong>{currentLevel}</strong>
          </div>
          <div className="metric-card">
            <span>Points Earned</span>
            <strong>{earnedPoints}</strong>
          </div>
          <div className="metric-card">
            <span>Progress</span>
            <strong>{Math.round(progress * 100)}%</strong>
          </div>
        </div>

        <div className="progress-block">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="small-text">{milestoneText}</p>
        </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
