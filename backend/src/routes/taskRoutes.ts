import express from 'express';
import { getTasks, getTaskCategories, getProviders, addTask, addActivityLog, getUserById, saveUser, updateReferralEarnings, getReferralByReferredUserId } from '../services/dbService.js';
import type { Task } from '../models/schemas.js';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const tasks = getTasks().filter(task => task.isActive);
  const ads = tasks.filter(task => task.type === 'ads').slice(0, 5);
  const easy = tasks.filter(task => task.type === 'easy');
  const medium = tasks.filter(task => task.type === 'medium');
  const long = tasks.filter(task => task.type === 'long');
  return res.json({ tasks: [...ads, ...easy, ...medium, ...long] });
});

router.get('/categories', async (req, res) => {
  return res.json({ categories: getTaskCategories() });
});

router.get('/providers', async (req, res) => {
  return res.json({ providers: getProviders() });
});

router.post('/', async (req, res) => {
  const { title, description, type, providerId, geo, reward, points, rules } = req.body;
  if (!title || !type || !providerId) return res.status(400).json({ message: 'Missing required task fields.' });
  const task: Task = {
    id: uuid(),
    title,
    description,
    type,
    providerId,
    geo: geo || [],
    reward: reward || 0,
    points: points || 0,
    isActive: true,
    rules: rules || '',
    availabilityStatus: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await addTask(task);
  await addActivityLog({ id: uuid(), userId: req.auth!.userId, type: 'create_task', details: { taskId: task.id }, createdAt: new Date().toISOString() });
  return res.json({ task });
});

router.post('/complete', async (req, res) => {
  const auth = req.auth;
  const { taskId } = req.body;
  const task = getTasks().find(item => item.id === taskId);
  if (!task || !task.isActive) return res.status(404).json({ message: 'Task not found or unavailable.' });
  const user = getUserById(auth!.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const earnedPoints = task.points || 0;
  const earnedBalance = task.reward || 0;
  user.points += earnedPoints;
  user.balance += earnedBalance;
  user.lastLoginAt = new Date().toISOString();
  await saveUser(user);
  if (user.referredBy) {
    await updateReferralEarnings(user.id, earnedBalance);
  }
  await addActivityLog({ id: uuid(), userId: user.id, type: 'task_complete', details: { taskId, reward: earnedBalance, points: earnedPoints }, createdAt: new Date().toISOString() });
  return res.json({ success: true, points: user.points, balance: user.balance });
});

export default router;
