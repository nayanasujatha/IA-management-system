// routes/subjects.js — Subject CRUD routes

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

// GET /api/subjects
router.get('/', requireAuth, (req, res) => {
  const { semester, facultyId } = req.query;
  let subjects = req.app.locals.db.subjects;
  if (semester)  subjects = subjects.filter(s => s.semester === +semester);
  if (facultyId) subjects = subjects.filter(s => s.facultyId === facultyId);
  res.json(subjects);
});

// GET /api/subjects/:code
router.get('/:code', requireAuth, (req, res) => {
  const subject = req.app.locals.db.subjects.find(s => s.code === req.params.code.toUpperCase());
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
});

// POST /api/subjects
router.post('/', requireAuth, requireRole('admin'), (req, res) => {
  const { code, name, semester, department, facultyId } = req.body;
  if (!code || !name || !semester || !department)
    return res.status(400).json({ error: 'Code, name, semester and department are required' });

  const db = req.app.locals.db;
  if (db.subjects.find(s => s.code === code.toUpperCase()))
    return res.status(400).json({ error: 'Subject code already exists' });

  const faculty = facultyId ? db.users.find(u => u.id === facultyId && u.role === 'faculty') : null;
  const subject = { code: code.toUpperCase(), name, semester: +semester, department, facultyId: facultyId || null, facultyName: faculty ? faculty.name : 'TBD' };
  db.subjects.push(subject);

  // Add subject code to faculty's subjects array
  if (faculty) {
    const fi = db.users.findIndex(u => u.id === facultyId);
    if (!db.users[fi].subjects.includes(code)) db.users[fi].subjects.push(code.toUpperCase());
  }
  res.status(201).json({ success: true, subject });
});

// PUT /api/subjects/:code
router.put('/:code', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.subjects.findIndex(s => s.code === req.params.code.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });

  const faculty = req.body.facultyId ? db.users.find(u => u.id === req.body.facultyId) : null;
  db.subjects[idx] = { ...db.subjects[idx], ...req.body, code: req.params.code.toUpperCase(), facultyName: faculty ? faculty.name : db.subjects[idx].facultyName };
  res.json({ success: true, subject: db.subjects[idx] });
});

// DELETE /api/subjects/:code
router.delete('/:code', requireAuth, requireRole('admin'), (req, res) => {
  const db  = req.app.locals.db;
  const idx = db.subjects.findIndex(s => s.code === req.params.code.toUpperCase());
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  db.subjects.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
