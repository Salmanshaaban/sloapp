import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { db } from '../db.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();
router.use(authenticate);

const MAX_ADS_PER_DAY = 20;
const REWARD_POINTS = 2;

function startOfDay(ts: Date) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d;
}

function ensureUserAdState(userId: string) {
  db.data ||= {};
  db.data.user_ads ||= [];

  let state = db.data.user_ads.find((s: any) => s.userId === userId);
  if (!state) {
    state = {
      userId,
      adsUsedToday: 0,
      lastAdDay: startOfDay(new Date()).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.data.user_ads.push(state);
  }
  return state;
}

function resetIfNewDay(state: any) {
  const last = new Date(state.lastAdDay);
  const now = new Date();
  const lastStart = startOfDay(last);
  const nowStart = startOfDay(now);

  if (lastStart.getTime() !== nowStart.getTime()) {
    state.adsUsedToday = 0;
    state.lastAdDay = nowStart.toISOString();
  }
  state.updatedAt = new Date().toISOString();
}

router.get('/status', async (req, res) => {
  const auth = req.auth!;
  const state = ensureUserAdState(auth.userId);
  resetIfNewDay(state);

  res.json({
    adsUsedToday: state.adsUsedToday,
    maxAdsPerDay: MAX_ADS_PER_DAY,
    remaining: Math.max(0, MAX_ADS_PER_DAY - state.adsUsedToday),
    isLimitReached: state.adsUsedToday >= MAX_ADS_PER_DAY,
    rewardPoints: REWARD_POINTS,
  });
});

// Called right when user clicks (التالي) to earn points for the just-finished ad.
router.post('/reward', async (req, res) => {
  const auth = req.auth!;
  const { clientNonce } = req.body || {};

  const user = db.data?.users?.find((u: any) => u.id === auth.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  db.data ||= {};
  db.data.ad_reward_receipts ||= [];

  if (clientNonce) {
    const exists = db.data.ad_reward_receipts.find((r: any) => r.userId === auth.userId && r.clientNonce === clientNonce);
    if (exists) {
      return res.json({
        success: true,
        pointsAwarded: 0,
        balance: user.balance,
        points: user.points,
        duplicate: true,
      });
    }
  }

  const state = ensureUserAdState(auth.userId);
  resetIfNewDay(state);

  if (state.adsUsedToday >= MAX_ADS_PER_DAY) {
    return res.status(403).json({
      message: 'Daily ad limit reached.',
      adsUsedToday: state.adsUsedToday,
      maxAdsPerDay: MAX_ADS_PER_DAY,
    });
  }

  state.adsUsedToday += 1;
  user.points += REWARD_POINTS;
  user.lastLoginAt = new Date().toISOString();

  // Persist
  await (async () => {
    // user already in lowdb, but we still call write() by awaiting saveUser-like.
    const { saveUser } = await import('../services/dbService.js');
    await saveUser(user);
    await db.write();
  })();

  if (clientNonce) {
    db.data.ad_reward_receipts.push({
      id: uuid(),
      userId: auth.userId,
      clientNonce,
      pointsAwarded: REWARD_POINTS,
      createdAt: new Date().toISOString(),
    });
    await db.write();
  }

  // Activity log (optional but useful)
  db.data.activity_logs ||= [];
  db.data.activity_logs.push({
    id: uuid(),
    userId: auth.userId,
    type: 'ad_reward',
    details: { pointsAwarded: REWARD_POINTS, maxAdsPerDay: MAX_ADS_PER_DAY, adsUsedToday: state.adsUsedToday },
    createdAt: new Date().toISOString(),
  });
  await db.write();

  const isLimitReached = state.adsUsedToday >= MAX_ADS_PER_DAY;

  res.json({
    success: true,
    duplicate: false,
    pointsAwarded: REWARD_POINTS,
    points: user.points,
    balance: user.balance,
    adsUsedToday: state.adsUsedToday,
    maxAdsPerDay: MAX_ADS_PER_DAY,
    isLimitReached,
  });
});

export default router;

