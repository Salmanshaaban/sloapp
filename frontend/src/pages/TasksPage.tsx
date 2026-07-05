import { useEffect, useState } from 'react';
import { fetchTasks, completeTask } from '../services/api';
import { openOfferwall, openUnityRewardedVideo } from '../services/ads';
import PageShell from '../ui/PageShell';

const categories = ['ads', 'easy', 'medium', 'long'];
const labels: Record<string, string> = { ads: 'Ads', easy: 'Easy Tasks', medium: 'Medium Tasks', long: 'Long Tasks' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
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
      openUnityRewardedVideo();
      setMessage('Unity Ads rewarded video opened.');
      return;
    }

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
