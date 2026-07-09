import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// بيانات الأدمن الثابتة
const ADMIN_EMAIL = 'slman05088@gmail.com';
const ADMIN_PASSWORD = 'Admin@2026#Secure';
const JWT_SECRET = 'SuperSecretJWTKey2026#Secure';

// تسجيل الدخول
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
  }

  // التحقق من الأدمن
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: { email, role: 'admin', name: 'Admin' }
    });
  }

  // مستخدم عادي (تسجيل دخول تجريبي)
  const token = jwt.sign({ email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({
    token,
    user: { email, role: 'user', name: 'User' }
  });
});

// جلب بيانات المستخدم الحالي
router.get('/me', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return res.json({ user: decoded });
  } catch {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
});

// تسجيل الخروج
router.post('/logout', (req: Request, res: Response) => {
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

export default router;