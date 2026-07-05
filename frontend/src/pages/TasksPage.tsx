import { useEffect, useRef, useState } from 'react';
import { fetchTasks, completeTask } from '../services/api';
import { openOfferwall, openUnityRewardedVideo } from '../services/ads';
import PageShell from '../ui/PageShell';
import { getAdsStatus, rewardAd } from '../services/adsCash';

const categories = ['ads', 'easy', 'medium', 'long'];
const labels: Record<string, string> = { ads: 'Ads', easy: 'Easy Tasks', medium: 'Medium Tasks', long: 'Long Tasks' };

declare global {
  interface Window {
    aclib?: {
      runInterstitial?: (opts: { zoneId: string }) => void;
    };
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);

  // Adcash interstitial reward loop (20 ads/day)
  const [adLoopOpen, setAdLoopOpen] = useState(false);
  const [adLoopLoading, setAdLoopLoading] = useState(false);
  const [adNextAvailable, setAdNextAvailable] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [adRemaining, setAdRemaining] = useState<number | null>(null);
  const loopNonceRef = useRef<string | null>(null);

  const adCooldownTimerRef = useRef<number | null>(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);

  const loadTasks = () => {
    setLoading(true);
    fetchTasks()
      .then(res => {
        setTasks(res.data.tasks || []);
        setMessage(res.data.tasks.length ? '' : 'No tasks available yet.');
      })
      .catch(() => setMessage('Unable to load tasks.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleStartTask = async (taskId: string, taskType?: string) => {
    if (taskType === 'ads') {
      try {
        const status = await getAdsStatus();
        if (status.isLimitReached) {
          setMessage('You reached the daily ad limit (20/20) for today.');
          return;
        }

        const nonce = String(Date.now()) + '-' + Math.random().toString(16).slice(2);
        loopNonceRef.current = nonce;

        setAdLoopOpen(true);
        setAdLoopLoading(true);
        setAdNextAvailable(false);
        setAdCountdown(5);
        setMessage('Opening interstitial ads...');

        // Show interstitial ad.
        window.aclib?.runInterstitial?.({ zoneId: '11604202' });

        // Fallback: if events are not wired, still allow user to continue after 5 seconds.
        if (adCooldownTimerRef.current) {
          window.clearInterval(adCooldownTimerRef.current);
        }

        // We will start the "next" countdown as soon as the reward request succeeds.
        // For now, timer will start immediately as a best-effort fallback.
        adCooldownTimerRef.current = window.setInterval(() => {
          setAdCountdown(prev => {
            if (prev <= 1) {
              window.clearInterval(adCooldownTimerRef.current!);
              setAdNextAvailable(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch {
        setMessage('Unable to start Adcash interstitial.');
      } finally {
        setAdLoopLoading(false);
      }
      return;
    }

    // Ensure Adcash close/reward logic if the SDK exposes events.
    // NOTE: Most Adcash setups don’t expose a reliable onClose callback via runInterstitial.
    // This page implements a best-effort reward flow: the user presses Next and we call /ads/reward.

    if (taskType === 'easy') {
      openOfferwall('surveys');
      setMessage('ayeT Studios offers opened for surveys.');
      return;
    }

    if (taskType === 'medium') {
      openOfferwall('appInstalls');
      setMessage('ayeT Studios offers opened for quick app installs.');
      return;
    }

    if (taskType === 'long') {
      openOfferwall('games');
      setMessage('ayeT Studios offers opened for milestone games.');
      return;
    }

    setLoadingTask(taskId);
    try {
      await completeTask(taskId);
      setMessage('Task completed and reward added to your account.');
      loadTasks();
    } catch {
      setMessage('Unable to complete this task right now.');
    } finally {
      setLoadingTask(null);
    }
  };

  return (
    <PageShell title="Tasks" subtitle="Complete premium tasks for balance and points.">
      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : (
        categories.map(category => {
          const items = tasks.filter(task => task.type === category || task.type === `${category}s`);
          return (
            <section key={category} className="card section-card">
              <h2>{labels[category]}</h2>
              {items.length === 0 ? (
                <div className="empty-state">No tasks available now</div>
              ) : (
                items.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-content">
                      <strong>{task.title}</strong>
                      <p>{task.description}</p>
                      <div className="small-text">Provider: {task.provider || task.providerId}</div>
                    </div>
                    <div className="history-right">
                      <span className="reward">+{task.reward || task.points} pts</span>
                      <span className={`status ${task.availabilityStatus || 'approved'}`}>{task.availabilityStatus || 'approved'}</span>
                      <button
                        type="button"
                        className="primary-button table-action"
                        onClick={() => handleStartTask(task.id, task.type)}
                        disabled={Boolean(loadingTask)}
                      >
                        {loadingTask === task.id ? 'Starting...' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          );
        })
      )}
      {message && <div className="message hint">{message}</div>}
    </PageShell>
  );
}
