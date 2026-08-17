// routes/reports.js — Report generation + Analytics routes

const express = require('express');
const router  = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');

const calcAvg = (ia1, ia2, ia3) => parseFloat(((+ia1 + +ia2 + +ia3) / 3).toFixed(2));

// GET /api/reports — student-wise report
router.get('/', requireAuth, requireRole('admin'), (req, res) => {
  const { semester, subjectCode } = req.query;
  const db = req.app.locals.db;

  let students = db.users.filter(u => u.role === 'student');
  if (semester) students = students.filter(s => s.semester === +semester);

  const report = students.map(s => {
    let marks = db.marks.filter(m => m.studentId === s.id);
    if (subjectCode) marks = marks.filter(m => m.subjectCode === subjectCode);

    const enrichedMarks = marks.map(m => {
      const subj = db.subjects.find(sub => sub.code === m.subjectCode);
      const avg  = calcAvg(m.ia1, m.ia2, m.ia3);
      return { subjectCode: m.subjectCode, subjectName: subj?.name || m.subjectCode, ia1: m.ia1, ia2: m.ia2, ia3: m.ia3, average: avg, result: avg >= 40 ? 'Pass' : 'Fail' };
    });

    const overall = enrichedMarks.length ? (enrichedMarks.reduce((a, m) => a + m.average, 0) / enrichedMarks.length).toFixed(1) : 'N/A';
    const passCount = enrichedMarks.filter(m => m.result === 'Pass').length;

    return { studentId: s.id, studentName: s.name, email: s.email, department: s.department, semester: s.semester, marks: enrichedMarks, overallAverage: +overall, passCount, failCount: enrichedMarks.length - passCount };
  });

  res.json(report);
});

// GET /api/analytics — dashboard stats + chart data
router.get('/analytics', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const students = db.users.filter(u => u.role === 'student');
  const faculty  = db.users.filter(u => u.role === 'faculty');

  const enriched = db.marks.map(m => ({ ...m, average: calcAvg(m.ia1, m.ia2, m.ia3) }));

  // Per-subject stats
  const subjectStats = db.subjects.map(s => {
    const sMarks = enriched.filter(m => m.subjectCode === s.code);
    const avg    = sMarks.length ? +(sMarks.reduce((a, m) => a + m.average, 0) / sMarks.length).toFixed(1) : 0;
    const pass   = sMarks.filter(m => m.average >= 40).length;
    return { code: s.code, name: s.name, avgScore: avg, students: sMarks.length, pass, fail: sMarks.length - pass };
  });

  // Top students
  const topStudents = students.map(s => {
    const sm      = enriched.filter(m => m.studentId === s.id);
    const overall = sm.length ? +(sm.reduce((a, m) => a + m.average, 0) / sm.length).toFixed(1) : 0;
    return { id: s.id, name: s.name, overall, subjects: sm.length };
  }).sort((a, b) => b.overall - a.overall).slice(0, 5);

  // At-risk students (any subject failing)
  const atRisk = students
    .filter(s => enriched.filter(m => m.studentId === s.id).some(m => m.average < 40))
    .map(({ password: _, ...s }) => s);

  // Recent entries (last 5)
  const recent = [...db.marks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(m => {
      const student = db.users.find(u => u.id === m.studentId);
      const subject = db.subjects.find(s => s.code === m.subjectCode);
      return { ...m, average: calcAvg(m.ia1, m.ia2, m.ia3), studentName: student?.name, subjectName: subject?.name };
    });

  res.json({
    totalStudents:     students.length,
    totalSubjects:     db.subjects.length,
    totalFaculty:      faculty.length,
    totalMarksEntered: db.marks.length,
    subjectStats,
    topStudents,
    atRisk,
    recentEntries: recent,
  });
});

module.exports = router;
