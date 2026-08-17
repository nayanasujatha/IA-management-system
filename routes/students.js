// routes/students.js — Student CRUD routes

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

const validate = (data) => {
  const errs = {};
  if (!data.name || !/^[A-Za-z\s.]+$/.test(data.name))  errs.name  = 'Letters only';
  if (!data.email || !data.email.includes('@'))           errs.email = 'Must contain @';
  if (!data.phone || !/^\d{10,}$/.test(data.phone))      errs.phone = 'Minimum 10 digits';
  if (!data.id    || !/^[A-Za-z0-9]+$/.test(data.id))    errs.id    = 'Alphanumeric only';
  if (!data.department)                                   errs.department = 'Required';
  if (!data.semester)                                     errs.semester   = 'Required';
  return errs;
};

// GET /api/students
router.get('/', requireAuth, (req, res) => {
  const { search, semester } = req.query;
  let students = req.app.locals.db.users.filter(u => u.role === 'student');
  if (search)   students = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
  if (semester) students = students.filter(s => s.semester === +semester);
  res.json(students.map(({ password: _, ...s }) => s));
});

// GET /api/students/:id
router.get('/:id', requireAuth, (req, res) => {
  const student = req.app.locals.db.users.find(u => u.id === req.params.id && u.role === 'student');
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const { password: _, ...safe } = student;
  res.json(safe);
});

// POST /api/students
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const errs = validate(req.body);
  if (Object.keys(errs).length) return res.status(400).json({ error: 'Validation failed', errors: errs });

  const db = req.app.locals.db;
  if (db.users.find(u => u.id === req.body.id))
    return res.status(400).json({ error: 'Student ID already exists' });

  const student = { ...req.body, semester: +req.body.semester, role: 'student', password: 'student123' };
  db.users.push(student);
  const { password: _, ...safe } = student;
  res.status(201).json({ success: true, student: safe });
});

// PUT /api/students/:id
router.put('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'student');
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.users[idx] = { ...db.users[idx], ...req.body, id: req.params.id };
  const { password: _, ...safe } = db.users[idx];
  res.json({ success: true, student: safe });
});

// DELETE /api/students/:id
router.delete('/:id', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'student');
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.users.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
