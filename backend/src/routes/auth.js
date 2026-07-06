import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const ADMIN_EMAIL = 'slman05088@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026#Secure';
const JWT_SECRET = 'SuperSecretJWTKey2026#Secure';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { email, role: 'admin', name: 'Admin' }
    });
  }

  const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { email, role: 'user', name: 'User' }
  });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

export default router;