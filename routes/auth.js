// routes/auth.js — Login / Logout routes
const User = require("../models/User");
const express = require('express');
const router = express.Router();
const { createSession, destroySession, requireAuth } = require('../middleware/auth');

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: id }, { student: id }]
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = createSession(user.id, user.role);
    const { password: _, ...safeUser } = user.toObject();
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// POST /api/logout
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers['x-auth-token'];
  destroySession(token);
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/me — get current user info
router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...safeUser } = user.toObject();
  res.json(safeUser);
});

module.exports = router;
