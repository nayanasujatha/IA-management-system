// routes/marks.js — IA Marks entry and retrieval routes

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

const calcAvg = (ia1, ia2, ia3) => parseFloat(((+ia1 + +ia2 + +ia3) / 3).toFixed(2));

// GET /api/marks — all marks (admin) or by filters
router.get('/', requireAuth, (req, res) => {
  const { studentId, subjectCode, facultyId } = req.query;
  let marks = req.app.locals.db.marks;
  if (studentId)   marks = marks.filter(m => m.studentId   === studentId);
  if (subjectCode) marks = marks.filter(m => m.subjectCode === subjectCode);
  if (facultyId)   marks = marks.filter(m => m.enteredBy   === facultyId);

  const db       = req.app.locals.db;
  const enriched = marks.map(m => {
    const student = db.users.find(u => u.id === m.studentId);
    const subject = db.subjects.find(s => s.code === m.subjectCode);
    return { ...m, average: calcAvg(m.ia1, m.ia2, m.ia3), result: calcAvg(m.ia1, m.ia2, m.ia3) >= 40 ? 'Pass' : 'Fail', studentName: student?.name || 'Unknown', subjectName: subject?.name || m.subjectCode };
  });
  res.json(enriched);
});

// GET /api/marks/:studentId — marks for one student
router.get('/:studentId', requireAuth, (req, res) => {
  const marks = req.app.locals.db.marks.filter(m => m.studentId === req.params.studentId);
  const db    = req.app.locals.db;
  const enriched = marks.map(m => {
    const subject = db.subjects.find(s => s.code === m.subjectCode);
    const avg     = calcAvg(m.ia1, m.ia2, m.ia3);
    return { ...m, average: avg, result: avg >= 40 ? 'Pass' : 'Fail', subjectName: subject?.name || m.subjectCode };
  });
  res.json(enriched);
});

// POST /api/marks — create or update marks
router.post('/', requireAuth, requireRole('admin', 'faculty'), (req, res) => {
  const { studentId, subjectCode, ia1, ia2, ia3, enteredBy } = req.body;
  if (!studentId || !subjectCode || ia1 === undefined || ia2 === undefined || ia3 === undefined)
    return res.status(400).json({ error: 'studentId, subjectCode, ia1, ia2, ia3 are required' });

  for (const [k, v] of Object.entries({ ia1, ia2, ia3 }))
    if (+v < 0 || +v > 100) return res.status(400).json({ error: `${k} must be between 0 and 100` });

  const db       = req.app.locals.db;
  const existing = db.marks.findIndex(m => m.studentId === studentId && m.subjectCode === subjectCode);
  const record   = { studentId, subjectCode, ia1: +ia1, ia2: +ia2, ia3: +ia3, enteredBy: enteredBy || req.userId, updatedAt: new Date().toISOString() };

  if (existing >= 0) db.marks[existing] = record;
  else db.marks.push(record);

  const avg = calcAvg(ia1, ia2, ia3);
  res.json({ success: true, marks: { ...record, average: avg, result: avg >= 40 ? 'Pass' : 'Fail' } });
});

// DELETE /api/marks — delete a mark record
router.delete('/', requireAuth, requireRole('admin'), (req, res) => {
  const { studentId, subjectCode } = req.query;
  const db  = req.app.locals.db;
  const idx = db.marks.findIndex(m => m.studentId === studentId && m.subjectCode === subjectCode);
  if (idx === -1) return res.status(404).json({ error: 'Mark record not found' });
  db.marks.splice(idx, 1);
  res.json({ success: true });
});

module.exports = router;
