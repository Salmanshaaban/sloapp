export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  balance: number;
  points: number;
  language: string;
  themeMode: 'light' | 'dark';
  status: 'active' | 'suspended' | 'banned';
  deviceId: string;
  fingerprint: string;
  provider?: 'google' | 'email';
  googleId?: string;
  referralCode: string;
  referredBy?: string;
  createdAt: string;
  lastLoginAt: string;
  settings: {
    notifications: boolean;
    darkMode: boolean;
  };
}

export interface TaskCategory {
  id: string;
  name: 'ads' | 'easy' | 'medium' | 'long';
  label: string;
  description: string;
  active: boolean;
}

export interface TaskProvider {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'disabled';
  geoRestrictions: string[];
  trafficRules: string;
  surveyRules: string;
  incentivePolicy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'ads' | 'easy' | 'medium' | 'long';
  providerId: string;
  geo: string[];
  reward: number;
  points: number;
  isActive: boolean;
  rules: string;
  availabilityStatus: 'approved' | 'pending' | 'restricted';
  createdAt: string;
  updatedAt: string;
}

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referralCode: string;
  currentLevel: number;
  referredEarnings: number;
  rewardPointsEarned: number;
  rewardStatus: 'active' | 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ReferralLevel {
  id: string;
  level: number;
  thresholdAmount: number;
  rewardPoints: number;
  description: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  payoutMethod: 'paypal' | 'bank' | 'crypto';
  accountDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedAt: string | null;
  approvedByAdminId: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  twoFactorEnabled: boolean;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  actionType: string;
  targetUserId: string | null;
  targetWithdrawalId: string | null;
  details: Record<string, any>;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  type: string;
  details: Record<string, any>;
  deviceId?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  category: 'system' | 'reward' | 'withdrawal' | 'referral';
  createdAt: string;
}
