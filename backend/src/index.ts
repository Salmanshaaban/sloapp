import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true }));

// Mount all API routes under /api
app.use('/api', routes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Initialize database
let dbReady = false;
initDb()
  .then(() => {
    dbReady = true;
    console.log('Database initialized');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

// For Vercel serverless: ensure DB is ready before handling requests
app.use((_req, res, next) => {
  if (!dbReady) {
    // Try to init again if first attempt failed
    initDb().then(() => { dbReady = true; }).catch(() => {});
  }
  next();
});

// إضافة كود الاستماع للمنفذ لضمان استمرار تشغيل السيرفر على Render بدون توقف
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(Server is running successfully on port ${PORT});
});

// Export for Vercel serverless
export default app;