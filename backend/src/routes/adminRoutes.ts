import express from 'express';
import { getUsers, getWithdrawals, getReferrals, getTaskCategories, getProviders, getAppSettings, getTasks, getActivityLogs, getAdminUsers, getNotifications, addAdminAction, addActivityLog, getUserById, saveUser, saveAdminUser } from '../services/dbService.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import { verifyPassword, createToken } from '../auth.js';
import { v4 as uuid } from 'uuid';
import { trackDevice, fraudHook } from '../middleware/security.js';

const router = express.Router();
router.use(trackDevice);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const admin = getAdminUsers().find(user => user.email.toLowerCase() === email.toLowerCase());
  if (!admin || !verifyPassword(password, admin.passwordHash)) return res.status(401).json({ message: 'Invalid credentials.' });
  const allowedAdminEmail = process.env.ADMIN_EMAIL?.toLowerCase() || 'slman05088@gmail.com';
  if (admin.email.toLowerCase() !== allowedAdminEmail) return res.status(403).json({ message: 'Admin access not permitted for this email.' });
  if (admin.status !== 'active') return res.status(403).json({ message: 'Account is not active.' });
  admin.lastLoginAt = new Date().toISOString();
  await saveAdminUser(admin);
  await addActivityLog({
    id: uuid(),
    userId: admin.id,
    type: 'admin_login',
    details: { email: admin.email, deviceId: req.body.deviceId, fingerprint: req.body.fingerprint, ...fraudHook(req) },
    createdAt: new Date().toISOString(),
  });
  return res.json({ token: createToken(admin.id, true), admin: { ...admin, passwordHash: undefined } });
});

router.use(authenticate, authorizeAdmin);

router.get('/dashboard', async (req, res) => {
  return res.json({
    users: getUsers(),
    withdrawals: getWithdrawals(),
    referrals: getReferrals(),
    tasks: getTasks(),
    providers: getProviders(),
    categories: getTaskCategories(),
    settings: getAppSettings(),
    activityLogs: getActivityLogs(),
    admins: getAdminUsers(),
    notifications: getNotifications(),
  });
});

router.post('/user/:id/action', async (req, res) => {
  const { id } = req.params;
  const { actionType, details } = req.body;
  const adminId = req.auth!.userId;
  await addAdminAction({ id: uuid(), adminId, actionType, targetUserId: id, targetWithdrawalId: null, details, createdAt: new Date().toISOString() });
  await addActivityLog({ id: uuid(), userId: adminId, type: 'admin_action', details: { actionType, targetUserId: id }, createdAt: new Date().toISOString() });
  if (actionType === 'ban_user' || actionType === 'suspend_user' || actionType === 'restore_user') {
    const user = getUserById(id);
    if (user) {
      user.status = actionType === 'restore_user' ? 'active' : actionType === 'ban_user' ? 'banned' : 'suspended';
      await saveUser(user);
    }
  }
  return res.json({ success: true });
});

export default router;
