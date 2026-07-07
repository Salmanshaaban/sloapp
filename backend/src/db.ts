import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Detect if running on Vercel (serverless)
const isVercel = !!process.env.VERCEL;

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../data/db.json');

// In-memory adapter for Vercel (serverless)
class MemoryAdapter<T> {
  private data: T | null = null;
  async read(): Promise<T | null> { return this.data; }
  async write(data: T): Promise<void> { this.data = data; }
}

// Use JSONFile adapter for local, MemoryAdapter for Vercel
const adapter = isVercel ? new MemoryAdapter<any>() : new JSONFile<any>(file);
export const db = new Low<any>(adapter);

// Set initial default data structure
function getDefaultData() {
  return {
    users: [],
    tasks: [],
    task_categories: [],
    task_providers: [],
    withdrawals: [],
    referrals: [],
    referral_levels: [
      { id: 'level-1', level: 1, thresholdAmount: 5, rewardPoints: 100, description: 'Reward for reaching referral level 1' },
      { id: 'level-2', level: 2, thresholdAmount: 10, rewardPoints: 100, description: 'Reward for reaching referral level 2' },
      { id: 'level-3', level: 3, thresholdAmount: 15, rewardPoints: 100, description: 'Reward for reaching referral level 3' },
      { id: 'level-4', level: 4, thresholdAmount: 20, rewardPoints: 100, description: 'Reward for reaching referral level 4' },
      { id: 'level-5', level: 5, thresholdAmount: 25, rewardPoints: 100, description: 'Reward for reaching referral level 5' },
    ],
    admin_users: [],
    admin_actions: [],
    activity_logs: [],
    app_settings: [
      { id: 'setting-1', key: 'brandName', value: 'Salo', description: 'App brand name.', updatedAt: new Date().toISOString() },
      { id: 'setting-2', key: 'theme', value: 'black-gold', description: 'Premium theme setting.', updatedAt: new Date().toISOString() },
      { id: 'setting-3', key: 'minimumWithdrawal', value: 5, description: 'Minimum withdrawal amount.', updatedAt: new Date().toISOString() },
    ],
    notifications: []
  };
}

export async function initDb() {
  if (isVercel) {
    // On Vercel: use in-memory store
    if (!db.data) {
      db.data = getDefaultData();
    }
    return;
  }

  // On local: use file-based lowdb
  await db.read();
  db.data ||= getDefaultData();
  await db.write();
}