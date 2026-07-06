import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(port, () => {
  console.log('Server running on http://localhost:' + port);
});