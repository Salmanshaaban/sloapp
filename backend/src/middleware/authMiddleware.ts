import express from 'express';
import { verifyToken, type AuthPayload } from '../auth.js';

// Augment Express Request to include typed auth
declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authenticate(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ message: 'Unauthorized' });
  req.auth = payload;
  next();
}

export function authorizeAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.auth;
  if (!auth?.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  next();
}
