// middleware/auth.js — Simple session-based auth middleware

/**
 * Usage: add to any route that needs protection
 * 
 * const { requireAuth, requireRole } = require('./middleware/auth');
 * 
 * router.get('/students', requireAuth, requireRole('admin'), handler);
 */

// In-memory session store (replace with express-session + MongoDB for production)
const sessions = {};

const createSession = (userId, role) => {
  const token = `${userId}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  sessions[token] = { userId, role, createdAt: Date.now() };
  return token;
};

const getSession = (token) => sessions[token] || null;

const destroySession = (token) => { delete sessions[token]; };

// Middleware: check if logged in
const requireAuth = (req, res, next) => {
  const token = req.headers['x-auth-token'] || req.query.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });
  req.userId = session.userId;
  req.userRole = session.role;
  next();
};

// Middleware: check role(s)
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole))
    return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
  next();
};

module.exports = { createSession, getSession, destroySession, requireAuth, requireRole };
