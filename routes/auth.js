// routes/auth.js — Login / Logout routes
const User = require("../models/User");
const express = require('express');
const router  = express.Router();
const { createSession, destroySession, requireAuth } = require('../middleware/auth');

// Shared in-memory user store (imported from server.js via app.locals)
// POST /api/login
router.post('/login', (req, res) => {
  const { id, password } = req.body;

  const user =  await User.findOne({
    $or:[{email:id},{student:id}]
  });
    if (!user || user.password!== password){
    return res.status(400).json({ error: "Invalid credentials" });
    }

    res.json({success:true,user})
    });
    

  const users = req.app.locals.db.users;
  const user  = users.find(u => u.id === id && u.password === password && u.email == email);
  if (!user)
    return res.status(401).json({ error: 'Invalid credentials' });

  const token = createSession(user.id, user.role);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

// POST /api/logout
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers['x-auth-token'];
  destroySession(token);
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/me — get current user info
router.get('/me', requireAuth, (req, res) => {
  const users = req.app.locals.db.users;
  const user  = users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

module.exports = router;
