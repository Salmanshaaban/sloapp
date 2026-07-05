import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, '../data/db.json');

const adapter = new JSONFile<any>(file);
export const db = new Low<any>(adapter);

export async function initDb() {
  await db.read();
  db.data ||= {
    users: [],
    tasks: [],
    task_categories: [],
    task_providers: [],
    withdrawals: [],
    referrals: [],
    referral_levels: [],
    admin_users: [],
    admin_actions: [],
    activity_logs: [],
    app_settings: [],
    notifications: []
  };
  await db.write();
}
