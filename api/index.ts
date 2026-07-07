import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true }));

// ========== IN-MEMORY DATABASE ==========
const db: any = {
  data: {
    users: [],
    tasks: [],
    task_categories: [
      { id: 'cat-1', name: 'ads', label: 'Ads', description: 'Paid ad views', active: true },
      { id: 'cat-2', name: 'easy', label: 'Easy Tasks', description: 'Simple tasks', active: true },
      { id: 'cat-3', name: 'medium', label: 'Medium Tasks', description: 'Moderate effort', active: true },
      { id: 'cat-4', name: 'long', label: 'Long Tasks', description: 'Premium tasks', active: true },
    ],
    task_providers: [
      { id: 'prov-1', name: 'providerA', status: 'approved', geoRestrictions: ['US','CA'], trafficRules: 'web', surveyRules: 'no duplicates', incentivePolicy: 'allowed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'prov-2', name: 'providerB', status: 'approved', geoRestrictions: ['US','GB'], trafficRules: 'non-deceptive', surveyRules: 'quality responses', incentivePolicy: 'allowed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    withdrawals: [],
    referrals: [],
    referral_levels: [
      { id: 'rl-1', level: 1, thresholdAmount: 5, rewardPoints: 100, description: 'Level 1' },
      { id: 'rl-2', level: 2, thresholdAmount: 10, rewardPoints: 100, description: 'Level 2' },
      { id: 'rl-3', level: 3, thresholdAmount: 15, rewardPoints: 100, description: 'Level 3' },
    ],
    admin_users: [
      { id: 'admin-1', name: 'Admin', email: 'slman05088@gmail.com', passwordHash: bcrypt.hashSync('Admin@2026#Secure', 10), role: 'superadmin', twoFactorEnabled: false, status: 'active', createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() },
    ],
    admin_actions: [],
    activity_logs: [],
    app_settings: [
      { id: 'set-1', key: 'brandName', value: 'Salo', description: 'Brand name', updatedAt: new Date().toISOString() },
      { id: 'set-2', key: 'theme', value: 'black-gold', description: 'Theme', updatedAt: new Date().toISOString() },
      { id: 'set-3', key: 'minimumWithdrawal', value: 5, description: 'Min withdrawal', updatedAt: new Date().toISOString() },
    ],
    notifications: [],
  }
};

// ========== AUTH HELPERS ==========
const JWT_SECRET = process.env.JWT_SECRET || 'SuperSecretJWTKey2026#Secure';

function createToken(userId: string, isAdmin = false) {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(token: string) {
  try { return jwt.verify(token, JWT_SECRET) as any; } catch { return null; }
}

function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ message: 'Unauthorized' });
  req.auth = payload;
  next();
}

function authorizeAdmin(req: any, res: any, next: any) {
  if (!req.auth?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  next();
}

// ========== AUTH ROUTES ==========
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  // Check admin
  const adminEmail = process.env.ADMIN_EMAIL || 'slman05088@gmail.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin@2026#Secure';
  if (email === adminEmail && password === adminPass) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { email, role: 'admin', name: 'Admin' } });
  }

  // Check regular user
  const user = db.data.users.find((u: any) => u.email === email.toLowerCase());
  if (user && bcrypt.compareSync(password, user.passwordHash)) {
    const token = createToken(user.id);
    return res.json({ token, user: { ...user, passwordHash: undefined } });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  if (db.data.users.find((u: any) => u.email === email.toLowerCase())) {
    return res.status(409).json({ message: 'Email already in use' });
  }
  const user = {
    id: uuid(),
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    balance: 0,
    points: 0,
    language: 'en',
    themeMode: 'dark',
    status: 'active',
    deviceId: '',
    fingerprint: '',
    provider: 'email',
    referralCode: uuid().slice(0, 8),
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    settings: { notifications: true, darkMode: true },
  };
  db.data.users.push(user);
  return res.json({ token: createToken(user.id), user: { ...user, passwordHash: undefined } });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'Logged out' });
});

// ========== TASKS ROUTES ==========
app.get('/api/tasks', authenticate, (_req, res) => {
  const tasks = db.data.tasks.filter((t: any) => t.isActive);
  const ads = tasks.filter((t: any) => t.type === 'ads').slice(0, 5);
  const easy = tasks.filter((t: any) => t.type === 'easy');
  const medium = tasks.filter((t: any) => t.type === 'medium');
  const long = tasks.filter((t: any) => t.type === 'long');
  return res.json({ tasks: [...ads, ...easy, ...medium, ...long] });
});

app.get('/api/tasks/categories', authenticate, (_req, res) => {
  return res.json({ categories: db.data.task_categories });
});

app.get('/api/tasks/providers', authenticate, (_req, res) => {
  return res.json({ providers: db.data.task_providers });
});

app.post('/api/tasks', authenticate, (req, res) => {
  const { title, description, type, providerId, geo, reward, points, rules } = req.body;
  if (!title || !type || !providerId) return res.status(400).json({ message: 'Missing required fields' });
  const task = {
    id: uuid(), title, description, type, providerId, geo: geo || [],
    reward: reward || 0, points: points || 0, isActive: true,
    rules: rules || '', availabilityStatus: 'approved',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  db.data.tasks.push(task);
  return res.json({ task });
});

app.post('/api/tasks/complete', authenticate, (req, res) => {
  const { taskId } = req.body;
  const task = db.data.tasks.find((t: any) => t.id === taskId);
  if (!task || !task.isActive) return res.status(404).json({ message: 'Task not found' });
  const user = db.data.users.find((u: any) => u.id === req.auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.points += task.points || 0;
  user.balance += task.reward || 0;
  return res.json({ success: true, points: user.points, balance: user.balance });
});

// ========== WITHDRAWAL ROUTES ==========
app.get('/api/withdrawals', authenticate, (req, res) => {
  const withdrawals = db.data.withdrawals.filter((w: any) => w.userId === req.auth.userId);
  return res.json({ withdrawals });
});

app.post('/api/withdrawals', authenticate, (req, res) => {
  const { amount, payoutMethod, accountDetails } = req.body;
  const user = db.data.users.find((u: any) => u.id === req.auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
  if (amount > user.balance) return res.status(400).json({ message: 'Insufficient balance' });
  const minWithdrawal = Number(db.data.app_settings.find((s: any) => s.key === 'minimumWithdrawal')?.value || 5);
  if (amount < minWithdrawal) return res.status(400).json({ message: `Minimum withdrawal is ${minWithdrawal}` });
  const withdrawal = {
    id: uuid(), userId: req.auth.userId, amount, payoutMethod: payoutMethod || 'paypal',
    accountDetails, status: 'pending', requestedAt: new Date().toISOString(),
    approvedAt: null, approvedByAdminId: null,
  };
  db.data.withdrawals.push(withdrawal);
  return res.json({ withdrawal });
});

app.get('/api/withdrawals/admin/all', authenticate, authorizeAdmin, (_req, res) => {
  return res.json({ withdrawals: db.data.withdrawals });
});

app.post('/api/withdrawals/:id/decision', authenticate, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  const withdrawal = db.data.withdrawals.find((w: any) => w.id === id);
  if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
  if (decision === 'approved') {
    const user = db.data.users.find((u: any) => u.id === withdrawal.userId);
    if (user && user.balance >= withdrawal.amount) {
      user.balance -= withdrawal.amount;
      withdrawal.status = 'approved';
    } else {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
  } else {
    withdrawal.status = 'rejected';
  }
  withdrawal.approvedAt = new Date().toISOString();
  withdrawal.approvedByAdminId = req.auth.userId;
  return res.json({ withdrawal });
});

// ========== REFERRAL ROUTES ==========
app.get('/api/referrals', authenticate, (req, res) => {
  const user = db.data.users.find((u: any) => u.id === req.auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const referrals = db.data.referrals.filter((r: any) => r.referrerUserId === user.id);
  const summary = referrals.reduce((acc: any, ref: any) => ({
    currentLevel: Math.max(acc.currentLevel, ref.currentLevel),
    referredEarnings: acc.referredEarnings + ref.referredEarnings,
    rewardPointsEarned: acc.rewardPointsEarned + ref.rewardPointsEarned,
  }), { currentLevel: 0, referredEarnings: 0, rewardPointsEarned: 0 });
  return res.json({
    referralLink: `https://salo.app/referral/${user.referralCode}`,
    currentLevel: summary.currentLevel,
    referredEarnings: summary.referredEarnings,
    rewardPointsEarned: summary.rewardPointsEarned,
    nextLevelTarget: 5,
    nextLevelProgress: Math.min(1, (summary.referredEarnings % 5) / 5),
    currentMilestone: `${(summary.referredEarnings % 5).toFixed(2)} / 5.00 points`,
    message: 'Invite your friend and earn a reward for every level they complete',
  });
});

// ========== SETTINGS ROUTES ==========
app.get('/api/settings', authenticate, (_req, res) => {
  return res.json({ settings: db.data.app_settings });
});

app.post('/api/settings/edit', authenticate, authorizeAdmin, (req, res) => {
  const { settings } = req.body;
  if (!Array.isArray(settings)) return res.status(400).json({ message: 'Invalid payload' });
  settings.forEach((setting: any) => {
    const found = db.data.app_settings.find((s: any) => s.key === setting.key);
    if (found) found.value = setting.value;
  });
  return res.json({ success: true, settings: db.data.app_settings });
});

// ========== ADMIN ROUTES ==========
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const admin = db.data.admin_users.find((a: any) => a.email === email.toLowerCase());
  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  if (admin.status !== 'active') return res.status(403).json({ message: 'Account not active' });
  admin.lastLoginAt = new Date().toISOString();
  return res.json({ token: createToken(admin.id, true), admin: { ...admin, passwordHash: undefined } });
});

app.get('/api/admin/dashboard', authenticate, authorizeAdmin, (_req, res) => {
  return res.json({
    users: db.data.users,
    withdrawals: db.data.withdrawals,
    referrals: db.data.referrals,
    tasks: db.data.tasks,
    providers: db.data.task_providers,
    categories: db.data.task_categories,
    settings: db.data.app_settings,
    activityLogs: db.data.activity_logs,
    admins: db.data.admin_users,
    notifications: db.data.notifications,
  });
});

// ========== ADS ROUTES ==========
const MAX_ADS_PER_DAY = 20;
const REWARD_POINTS = 2;

app.get('/api/ads/status', authenticate, (req, res) => {
  const userId = req.auth.userId;
  db.data.user_ads = db.data.user_ads || [];
  let state = db.data.user_ads.find((s: any) => s.userId === userId);
  if (!state) {
    state = { userId, adsUsedToday: 0, lastAdDay: new Date().toISOString() };
    db.data.user_ads.push(state);
  }
  res.json({
    adsUsedToday: state.adsUsedToday,
    maxAdsPerDay: MAX_ADS_PER_DAY,
    remaining: Math.max(0, MAX_ADS_PER_DAY - state.adsUsedToday),
    isLimitReached: state.adsUsedToday >= MAX_ADS_PER_DAY,
    rewardPoints: REWARD_POINTS,
  });
});

app.post('/api/ads/reward', authenticate, (req, res) => {
  const userId = req.auth.userId;
  const user = db.data.users.find((u: any) => u.id === userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  db.data.user_ads = db.data.user_ads || [];
  let state = db.data.user_ads.find((s: any) => s.userId === userId);
  if (!state) {
    state = { userId, adsUsedToday: 0, lastAdDay: new Date().toISOString() };
    db.data.user_ads.push(state);
  }
  if (state.adsUsedToday >= MAX_ADS_PER_DAY) {
    return res.status(403).json({ message: 'Daily limit reached' });
  }
  state.adsUsedToday += 1;
  user.points += REWARD_POINTS;
  return res.json({
    success: true, pointsAwarded: REWARD_POINTS,
    points: user.points, balance: user.balance,
    adsUsedToday: state.adsUsedToday, maxAdsPerDay: MAX_ADS_PER_DAY,
    isLimitReached: state.adsUsedToday >= MAX_ADS_PER_DAY,
  });
});

// ========== OFFERWALL ROUTES ==========
app.get('/api/offerwall/sandbox/config', authenticate, (req, res) => {
  res.json({ sandboxMode: true, testUserId: req.auth.userId, productionRewards: false });
});

app.post('/api/offerwall/sandbox/reward', authenticate, (req, res) => {
  const { transactionId, rewardPoints = 0, rewardBalance = 0 } = req.body;
  if (!transactionId) return res.status(400).json({ message: 'transactionId required' });
  const user = db.data.users.find((u: any) => u.id === req.auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.points += Number(rewardPoints);
  user.balance += Number(rewardBalance);
  return res.json({ duplicate: false, points: user.points, balance: user.balance });
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running', users: db.data.users.length });
});

// ========== EXPORT FOR VERCEL ==========
export default app;