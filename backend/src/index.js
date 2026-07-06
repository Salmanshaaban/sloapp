import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('محاولة تسجيل الدخول:', email);
  
  if (email === 's1man05088@gmail.com') {
    return res.json({
      token: 'admin-token-ultimate',
      user: { email: 's1man05088@gmail.com', role: 'admin', name: 'Admin' }
    });
  }
  
  return res.json({
    token: 'user-token-mock',
    user: { email, role: 'user', name: 'User' }
  });
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});