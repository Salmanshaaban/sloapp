import express from 'express';
import { getAppSettings, addActivityLog } from '../services/dbService.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
import { v4 as uuid } from 'uuid';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  return res.json({ settings: getAppSettings() });
});

router.post('/edit', authorizeAdmin, async (req, res) => {
  const { settings } = req.body;
  const adminId = req.auth!.userId;
  if (!Array.isArray(settings)) return res.status(400).json({ message: 'Invalid settings payload.' });
  settings.forEach((setting: any) => {
    const found = getAppSettings().find(item => item.key === setting.key);
    if (found) found.value = setting.value;
  });
  await addActivityLog({ id: uuid(), userId: adminId, type: 'settings_updated', details: { settings }, createdAt: new Date().toISOString() });
  return res.json({ success: true, settings: getAppSettings() });
});

export default router;
