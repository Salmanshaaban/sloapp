import express from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import { getWithdrawals, addWithdrawal, addActivityLog, getUserById, addAdminAction, getAppSettings, saveUser } from '../services/dbService.js';
import type { Withdrawal } from '../models/schemas.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const auth = req.auth;
  const withdrawals = getWithdrawals().filter(withdrawal => withdrawal.userId === auth!.userId);
  return res.json({ withdrawals });
});

router.post('/', async (req, res) => {
  const auth = req.auth;
  const { amount, payoutMethod, accountDetails } = req.body;
  const user = getUserById(auth!.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount.' });
  if (!accountDetails) return res.status(400).json({ message: 'Account details required.' });
  if (amount > user.balance) return res.status(400).json({ message: 'Amount exceeds balance.' });
  const minimumWithdrawal = Number(getAppSettings().find(setting => setting.key === 'minimumWithdrawal')?.value || 5);
  if (amount < minimumWithdrawal) return res.status(400).json({ message: `Minimum withdrawal is ${minimumWithdrawal} points.` });

  const withdrawal: Withdrawal = {
    id: uuid(),
    userId: auth!.userId,
    amount,
    payoutMethod: payoutMethod || 'paypal',
    accountDetails,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    approvedAt: null,
    approvedByAdminId: null,
  };

  await addWithdrawal(withdrawal);
  await addActivityLog({ id: uuid(), userId: auth!.userId, type: 'withdrawal_requested', details: withdrawal, createdAt: new Date().toISOString() });
  return res.json({ withdrawal });
});

router.post('/:id/decision', authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  const withdrawal = getWithdrawals().find(item => item.id === id);
  if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found.' });
  if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ message: 'Invalid decision.' });
  if (decision === 'approved') {
    const user = getUserById(withdrawal.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.balance < withdrawal.amount) return res.status(400).json({ message: 'Insufficient balance to approve this withdrawal.' });
    user.balance -= withdrawal.amount;
    await saveUser(user);
    withdrawal.status = 'approved';
  } else {
    withdrawal.status = 'rejected';
  }
  withdrawal.approvedAt = new Date().toISOString();
  withdrawal.approvedByAdminId = req.auth!.userId;
  await addActivityLog({ id: uuid(), userId: req.auth!.userId, type: 'withdrawal_decision', details: { withdrawalId: id, decision }, createdAt: new Date().toISOString() });
  await addAdminAction({ id: uuid(), adminId: req.auth!.userId, actionType: 'withdrawal_' + decision, targetUserId: withdrawal.userId, targetWithdrawalId: withdrawal.id, details: { amount: withdrawal.amount }, createdAt: new Date().toISOString() });
  return res.json({ withdrawal });
});

router.get('/admin/all', authorizeAdmin, async (req, res) => {
  return res.json({ withdrawals: getWithdrawals() });
});

export default router;
