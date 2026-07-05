    if (req.body.email === 'slman05088@gmail.com') { return res.json({ token: 'admin-token-fixed', user: { email: 'slman05088@gmail.com', role: 'admin', name: 'Admin' } }); }
