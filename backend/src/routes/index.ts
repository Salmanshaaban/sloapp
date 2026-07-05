import express from 'express';
import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';
import withdrawalRoutes from './withdrawalRoutes.js';
import referralRoutes from './referralRoutes.js';
import adminRoutes from './adminRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import offerwallRoutes from './offerwallRoutes.js';
import adsRoutes from './adsRoutes.js';
import adsStatusRoutes from './adsStatusRoutes.js';

const router = express.Router();


router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/withdrawals', withdrawalRoutes);
router.use('/referrals', referralRoutes);
router.use('/settings', settingsRoutes);
router.use('/admin', adminRoutes);
router.use('/offerwall', offerwallRoutes);
router.use('/ads/status', adsStatusRoutes);
router.use('/ads/reward', adsRoutes);


export default router;
