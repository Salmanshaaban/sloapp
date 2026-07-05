import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { db } from '../db.js';

const router = express.Router();
router.use(authenticate);

const MAX_ADS_PER_DAY = 20;

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
  const lastStart = startOfDay(new Date(state.lastAdDay));
  const nowStart = startOfDay(new Date());
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
  });
});

export default router;

