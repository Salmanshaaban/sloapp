import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'salo_dev_secret';

export interface AuthPayload {
  userId: string;
  isAdmin: boolean;
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function createToken(userId: string, isAdmin = false) {
  return jwt.sign({ userId, isAdmin } satisfies AuthPayload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    if (!payload || typeof payload.userId !== 'string') return null;
    return payload;
  } catch {
    return null;
  }
}

export function currentUser(token?: string) {
  if (!token) return null;
  const data = verifyToken(token);
  if (!data) return null;
  return (db.data as any)?.users?.find((user: any) => user.id === data.userId) || null;
}
