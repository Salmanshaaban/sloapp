import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getUserById, saveUser, addActivityLog } from '../services/dbService.js';
import { db } from '../db.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

const SANDBOX_TEST_USER_ID = 'testuser123';
const SANDBOX_TEST_USER_EMAIL = 'sandbox@testuser123.local';

async function ensureSandboxUser() {
  let user = getUserById(SANDBOX_TEST_USER_ID);
  if (!user) {
    user = {
      id: SANDBOX_TEST_USER_ID,
      name: 'Sandbox Tester',
      email: SANDBOX_TEST_USER_EMAIL,
      passwordHash: '',
      balance: 0,
      points: 0,
      language: 'en',
      themeMode: 'dark',
      status: 'active',
      deviceId: 'sandbox-device',
      fingerprint: 'sandbox-fingerprint',
      provider: 'email',
      referralCode: uuid().slice(0, 8),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      settings: { notifications: false, darkMode: true },
    };
    db.data?.users.push(user);
    await db.write();
  }
  return user;
}

router.get('/sandbox/config', authenticate, async (req, res) => {
  const auth = req.auth;
  return res.json({ sandboxMode: true, testUserId: auth!.userId, productionRewards: false });
});

router.post('/sandbox/reward', authenticate, async (req, res) => {
  const { transactionId, offerId, rewardPoints = 0, rewardBalance = 0, userId } = req.body;
  if (!transactionId) {
    return res.status(400).json({ message: 'transactionId is required.' });
  }

  const auth = req.auth;
  const requestingUser = getUserById(auth!.userId);
  if (!requestingUser) {
    return res.status(401).json({ message: 'Unauthorized user.' });
  }

  const targetUserId = userId || requestingUser.id;
  const user = getUserById(targetUserId);
  if (!user) {
    return res.status(404).json({ message: 'Sandbox user not found.' });
  }

  const existingReward = db.data?.activity_logs.find((log: any) => log.type === 'offerwall_reward' && log.details?.transactionId === transactionId);
  if (existingReward) {
    return res.json({ duplicate: true, points: user.points, balance: user.balance });
  }

  user.points += Number(rewardPoints);
  user.balance += Number(rewardBalance);
  user.lastLoginAt = new Date().toISOString();
  await saveUser(user);

  await addActivityLog({
    id: uuid(),
    userId: user.id,
    type: 'offerwall_reward',
    details: { transactionId, offerId, rewardPoints, rewardBalance, sandbox: true },
    createdAt: new Date().toISOString(),
  });

  return res.json({ duplicate: false, points: user.points, balance: user.balance });
});

router.post('/sandbox/callback', authenticate, async (req, res) => {
  const { transactionId, eventType, userId, info } = req.body;
  if (!transactionId || !eventType || !userId) {
    return res.status(400).json({ message: 'transactionId, eventType, and userId are required.' });
  }

  const auth = req.auth;
  const requestingUser = getUserById(auth!.userId);
  if (!requestingUser) {
    return res.status(401).json({ message: 'Unauthorized user.' });
  }

  if (requestingUser.id !== userId && requestingUser.email !== SANDBOX_TEST_USER_EMAIL) {
    return res.status(403).json({ message: 'Sandbox callback can only be logged for the sandbox test user.' });
  }

  await addActivityLog({
    id: uuid(),
    userId,
    type: 'offerwall_callback',
    details: { transactionId, eventType, info, sandbox: true },
    createdAt: new Date().toISOString(),
  });

  return res.json({ received: true });
});

export default router;
