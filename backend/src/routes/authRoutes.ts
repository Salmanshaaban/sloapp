import express from 'express';
import { v4 as uuid } from 'uuid';
import { hashPassword, verifyPassword, createToken } from '../auth.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { getUserByEmail, getUserById, saveUser, getUserByReferralCode, addActivityLog, addReferral } from '../services/dbService.js';
import type { User, Referral } from '../models/schemas.js';
import { fraudHook, trackDevice } from '../middleware/security.js';

const router = express.Router();
router.use(trackDevice);

router.post('/signup', async (req, res) => {
  const { email, password, name, deviceId, fingerprint, referralCode } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  if (getUserByEmail(email)) return res.status(409).json({ message: 'Email already in use.' });

  const user: User = {
    id: uuid(),
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    balance: 0,
    points: 0,
    language: 'en',
    themeMode: 'dark',
    status: 'active',
    deviceId: deviceId || '',
    fingerprint: fingerprint || '',
    provider: 'email',
    referralCode: uuid().slice(0, 8),
    referredBy: undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    settings: {
      notifications: true,
      darkMode: true,
    },
  };

  if (referralCode) {
    const referrer = getUserByReferralCode(referralCode);
    if (referrer) {
      user.referredBy = referrer.id;
      const referral: Referral = {
        id: uuid(),
        referrerUserId: referrer.id,
        referredUserId: user.id,
        referralCode,
        currentLevel: 0,
        referredEarnings: 0,
        rewardPointsEarned: 0,
        rewardStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addReferral(referral);
    }
  }

  await saveUser(user);
  await addActivityLog({ id: uuid(), userId: user.id, type: 'signup', details: { email: user.email }, deviceId: user.deviceId, createdAt: new Date().toISOString() });
  return res.json({ token: createToken(user.id), user: { ...user, passwordHash: undefined } });
});

router.post('/login', async (req, res) => {
  const { email, password, deviceId, fingerprint } = req.body;
  const user = getUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
  if (!verifyPassword(password, user.passwordHash)) return res.status(401).json({ message: 'Invalid credentials.' });
  if (user.status !== 'active') return res.status(403).json({ message: 'Account is not active.' });
  user.lastLoginAt = new Date().toISOString();
  user.deviceId = deviceId || user.deviceId;
  user.fingerprint = fingerprint || user.fingerprint;
  await saveUser(user);
  await addActivityLog({ id: uuid(), userId: user.id, type: 'login', details: { email: user.email, ...fraudHook(req) }, deviceId: user.deviceId, createdAt: new Date().toISOString() });
  return res.json({ token: createToken(user.id), user: { ...user, passwordHash: undefined } });
});

router.post('/google', async (req, res) => {
  const { email, name, googleId, deviceId, fingerprint } = req.body;
  if (!email || !googleId) return res.status(400).json({ message: 'Google sign-in data required.' });
  let user = getUserByEmail(email);
  if (!user) {
    user = {
      id: uuid(),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      passwordHash: '',
      balance: 0,
      points: 0,
      language: 'en',
      themeMode: 'dark',
      status: 'active',
      deviceId: deviceId || '',
      fingerprint: fingerprint || '',
      provider: 'google',
      googleId,
      referralCode: uuid().slice(0, 8),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      settings: { notifications: true, darkMode: true },
    };
    await saveUser(user);
  }
  user.lastLoginAt = new Date().toISOString();
  await saveUser(user);
  await addActivityLog({ id: uuid(), userId: user.id, type: 'google_login', details: { email: user.email }, deviceId: user.deviceId, createdAt: new Date().toISOString() });
  return res.json({ token: createToken(user.id), user: { ...user, passwordHash: undefined } });
});

router.get('/profile', authenticate, async (req, res) => {
  const auth = req.auth;
  const user = auth ? getUserById(auth.userId) : null;
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  return res.json({ user: { ...user, passwordHash: undefined } });
});

export default router;
