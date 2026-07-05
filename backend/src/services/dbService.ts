import { db } from '../db.js';
import type { User, Task, TaskCategory, TaskProvider, Referral, ReferralLevel, Withdrawal, AdminUser, AdminAction, ActivityLog, AppSetting, Notification } from '../models/schemas.js';

export function getUsers(): User[] { return db.data?.users || []; }
export function getUserById(id: string) { return db.data?.users.find((u: User) => u.id === id); }
export function getUserByEmail(email: string) { return db.data?.users.find((u: User) => u.email === email.toLowerCase()); }
export function getUserByReferralCode(code: string) { return db.data?.users.find((u: User) => u.referralCode === code); }
export function saveUser(user: User) {
  const existingIndex = db.data?.users.findIndex((u: User) => u.id === user.id);
  if (existingIndex !== undefined && existingIndex >= 0) {
    db.data!.users[existingIndex] = user;
  } else {
    db.data?.users.push(user);
  }
  return db.write();
}

export function getTasks(): Task[] { return db.data?.tasks || []; }
export function addTask(task: Task) { db.data?.tasks.push(task); return db.write(); }
export function getTaskCategories(): TaskCategory[] { return db.data?.task_categories || []; }
export function getProviders(): TaskProvider[] { return db.data?.task_providers || []; }

export function getReferrals(): Referral[] { return db.data?.referrals || []; }
export function getReferralByReferredUserId(userId: string) { return db.data?.referrals.find((r: Referral) => r.referredUserId === userId); }
export function getReferralByReferrerUserId(userId: string) { return db.data?.referrals.find((r: Referral) => r.referrerUserId === userId); }
export function addReferral(referral: Referral) { db.data?.referrals.push(referral); return db.write(); }
export function updateReferralEarnings(referredUserId: string, earnedAmount: number) {
  const referral = db.data?.referrals.find((r: Referral) => r.referredUserId === referredUserId);
  if (!referral) return null;
  referral.referredEarnings += earnedAmount;
  const newLevel = Math.floor(referral.referredEarnings / 5);
  const levelConfig = db.data?.referral_levels.find((level: any) => level.level === newLevel);
  const rewardPointsForLevel = levelConfig?.rewardPoints ?? 100;
  const previousLevel = referral.currentLevel;
  if (newLevel > previousLevel) {
    const additionalPoints = (newLevel - previousLevel) * rewardPointsForLevel;
    referral.currentLevel = newLevel;
    referral.rewardPointsEarned = newLevel * rewardPointsForLevel;
    referral.rewardStatus = 'active';
    const referrer = db.data?.users.find((u: User) => u.id === referral.referrerUserId);
    if (referrer) {
      referrer.points += additionalPoints;
    }
  }
  referral.updatedAt = new Date().toISOString();
  return db.write().then(() => referral);
}
export function getReferralLevels(): ReferralLevel[] { return db.data?.referral_levels || []; }
export function addReferralLevel(level: ReferralLevel) { db.data?.referral_levels.push(level); return db.write(); }

export function getWithdrawals(): Withdrawal[] { return db.data?.withdrawals || []; }
export function addWithdrawal(withdrawal: Withdrawal) { db.data?.withdrawals.push(withdrawal); return db.write(); }
export function getAdminUsers(): AdminUser[] { return db.data?.admin_users || []; }
export function saveAdminUser(admin: AdminUser) {
  const existingIndex = db.data?.admin_users.findIndex((u: AdminUser) => u.id === admin.id);
  if (existingIndex !== undefined && existingIndex >= 0) {
    db.data!.admin_users[existingIndex] = admin;
  } else {
    db.data?.admin_users.push(admin);
  }
  return db.write();
}
export function addAdminAction(action: AdminAction) { db.data?.admin_actions.push(action); return db.write(); }
export function addActivityLog(entry: ActivityLog) { db.data?.activity_logs.push(entry); return db.write(); }
export function getActivityLogs(): ActivityLog[] { return db.data?.activity_logs || []; }
export function getAppSettings(): AppSetting[] { return db.data?.app_settings || []; }
export function getNotifications(): Notification[] { return db.data?.notifications || []; }
export function addNotification(notification: Notification) { db.data?.notifications.push(notification); return db.write(); }
