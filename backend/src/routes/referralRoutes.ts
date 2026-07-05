import express from 'express';
import { getReferrals, getUserById, getReferralLevels, addActivityLog } from '../services/dbService.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const auth = req.auth;
  const user = getUserById(auth!.userId);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  const referrals = getReferrals().filter(ref => ref.referrerUserId === user.id);
  const summary = referrals.reduce(
    (acc, ref) => ({
      currentLevel: Math.max(acc.currentLevel, ref.currentLevel),
      referredEarnings: acc.referredEarnings + ref.referredEarnings,
      rewardPointsEarned: acc.rewardPointsEarned + ref.rewardPointsEarned,
    }),
    { currentLevel: 0, referredEarnings: 0, rewardPointsEarned: 0 }
  );
  const progressValue = summary.referredEarnings % 5;
  const progressPercent = Math.min(1, progressValue / 5);
  return res.json({
    referralLink: `https://salo.app/referral/${user.referralCode}`,
    currentLevel: summary.currentLevel,
    referredEarnings: summary.referredEarnings,
    rewardPointsEarned: summary.rewardPointsEarned,
    nextLevelTarget: 5,
    nextLevelProgress: progressPercent,
    currentMilestone: `${progressValue.toFixed(2)} / 5.00 points`,
    message: 'Invite your friend and earn a reward for every level they complete',
  });
});

export default router;
