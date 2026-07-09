import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import routes from './routes/index.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*', credentials: true }));

app.use('/api', routes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

let dbReady = false;
initDb()
  .then(() => {
    dbReady = true;
    console.log('Database initialized');
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
  });

app.use((_req, res, next) => {
  if (!dbReady) {
    initDb().then(() => { dbReady = true; }).catch(() => {});
  }
  next();
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(Server is running successfully on port ${PORT});
});

export default app;