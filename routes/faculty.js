// routes/faculty.js — Faculty CRUD routes

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/faculty
router.get('/', requireAuth, (req, res) => {
  const faculty = req.app.locals.db.users.filter(u => u.role === 'faculty');
  res.json(faculty.map(({ password: _, ...f }) => f));
});

// POST /api/faculty
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { name, id, email, phone, department } = req.body;
  const errs = {};
  if (!name  || !/^[A-Za-z\s.]+$/.test(name))  errs.name  = 'Letters only';
  if (!email || !email.includes('@'))            errs.email = 'Must contain @';
  if (!phone || !/^\d{10,}$/.test(phone))        errs.phone = 'Min 10 digits';
  if (!id    || !/^[A-Za-z0-9]+$/.test(id))      errs.id    = 'Alphanumeric only';
  if (!department)                               errs.department = 'Required';
  if (Object.keys(errs).length) return res.status(400).json({ error: 'Validation failed', errors: errs });

  const db = req.app.locals.db;
  if (db.users.find(u => u.id === id))
    return res.status(400).json({ error: 'Faculty ID already exists' });

  const faculty = { id, name, email, phone, department, role: 'faculty', password: 'faculty123', subjects: [] };
  db.users.push(faculty);
  const { password: _, ...safe } = faculty;
  res.status(201).json({ success: true, faculty: safe });
});

// PUT /api/faculty/:id
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'faculty');
  if (idx === -1) return res.status(404).json({ error: 'Faculty not found' });
  db.users[idx] = { ...db.users[idx], ...req.body, id: req.params.id };
  const { password: _, ...safe } = db.users[idx];
  res.json({ success: true, faculty: safe });
});

// DELETE /api/faculty/:id
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'faculty');
  if (idx === -1) return res.status(404).json({ error: 'Faculty not found' });
  db.users.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
