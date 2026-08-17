require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── IN-MEMORY DATABASE ──────────────────────────────────────────────────────
let db = {
  users: [
    { id: 'admin001', name: 'Admin User', email: 'admin@college.edu', password: 'admin123', role: 'admin' },
    { id: 'FAC001', name: 'Dr. Priya Sharma', email: 'priya@college.edu', password: 'faculty123', role: 'faculty', department: 'CSE', phone: '9876543210', subjects: ['CS301', 'CS302'] },
    { id: 'FAC002', name: 'Prof. Rajan Mehta', email: 'rajan@college.edu', password: 'faculty123', role: 'faculty', department: 'CSE', phone: '9876543211', subjects: ['CS303'] },
    { id: 'STU001', name: 'Arjun Patel', email: 'arjun@student.edu', password: 'student123', role: 'student', department: 'CSE', semester: 3, phone: '9876500001' },
    { id: 'STU002', name: 'Sneha Reddy', email: 'sneha@student.edu', password: 'student123', role: 'student', department: 'CSE', semester: 3, phone: '9876500002' },
    { id: 'STU003', name: 'Kiran Kumar', email: 'kiran@student.edu', password: 'student123', role: 'student', department: 'CSE', semester: 3, phone: '9876500003' },
    { id: 'STU004', name: 'Meera Nair', email: 'meera@student.edu', password: 'student123', role: 'student', department: 'CSE', semester: 3, phone: '9876500004' },
    { id: 'STU005', name: 'Rohit Singh', email: 'rohit@student.edu', password: 'student123', role: 'student', department: 'CSE', semester: 3, phone: '9876500005' },
  ],
  subjects: [
    { code: 'CS301', name: 'Database Management Systems', semester: 3, department: 'CSE', facultyId: 'FAC001', facultyName: 'Dr. Priya Sharma' },
    { code: 'CS302', name: 'Operating Systems', semester: 3, department: 'CSE', facultyId: 'FAC001', facultyName: 'Dr. Priya Sharma' },
    { code: 'CS303', name: 'Computer Networks', semester: 3, department: 'CSE', facultyId: 'FAC002', facultyName: 'Prof. Rajan Mehta' },
    { code: 'CS304', name: 'Software Engineering', semester: 3, department: 'CSE', facultyId: null, facultyName: 'TBD' },
  ],
  marks: [
    { studentId: 'STU001', subjectCode: 'CS301', ia1: 45, ia2: 48, ia3: 40, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU001', subjectCode: 'CS302', ia1: 38, ia2: 42, ia3: 35, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU001', subjectCode: 'CS303', ia1: 50, ia2: 55, ia3: 48, enteredBy: 'FAC002', updatedAt: new Date().toISOString() },
    { studentId: 'STU002', subjectCode: 'CS301', ia1: 30, ia2: 28, ia3: 32, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU002', subjectCode: 'CS302', ia1: 60, ia2: 65, ia3: 70, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU003', subjectCode: 'CS301', ia1: 75, ia2: 80, ia3: 78, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU003', subjectCode: 'CS303', ia1: 55, ia2: 60, ia3: 58, enteredBy: 'FAC002', updatedAt: new Date().toISOString() },
    { studentId: 'STU004', subjectCode: 'CS301', ia1: 20, ia2: 25, ia3: 22, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU005', subjectCode: 'CS302', ia1: 85, ia2: 88, ia3: 90, enteredBy: 'FAC001', updatedAt: new Date().toISOString() },
    { studentId: 'STU005', subjectCode: 'CS303', ia1: 72, ia2: 75, ia3: 70, enteredBy: 'FAC002', updatedAt: new Date().toISOString() },
  ]
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const calcAvg = (ia1, ia2, ia3) => parseFloat(((+ia1 + +ia2 + +ia3) / 3).toFixed(2));

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { id, email, password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });
  // Support login by ID OR by email
  const user = db.users.find(u => {
    const matchId    = id    && u.id    === id;
    const matchEmail = email && u.email === email;
    return (matchId || matchEmail) && u.password === password;
  });
  if (!user) return res.status(401).json({ error: 'Invalid credentials. Check your ID/email and password.' });
  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
app.get('/api/students', (req, res) => {
  const students = db.users.filter(u => u.role === 'student');
  res.json(students.map(({ password: _, ...s }) => s));
});

app.post('/api/students', (req, res) => {
  const { name, id, email, phone, department, semester } = req.body;
  if (!name || !id || !email || !phone || !department || !semester)
    return res.status(400).json({ error: 'All fields required' });
  if (db.users.find(u => u.id === id))
    return res.status(400).json({ error: 'Student ID already exists' });
  const student = { id, name, email, phone, department, semester: +semester, role: 'student', password: 'student123' };
  db.users.push(student);
  const { password: _, ...safe } = student;
  res.json({ success: true, student: safe });
});

app.put('/api/students/:id', (req, res) => {
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'student');
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.users[idx] = { ...db.users[idx], ...req.body };
  const { password: _, ...safe } = db.users[idx];
  res.json({ success: true, student: safe });
});

app.delete('/api/students/:id', (req, res) => {
  const idx = db.users.findIndex(u => u.id === req.params.id && u.role === 'student');
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  db.users.splice(idx, 1);
  res.json({ success: true });
});

// ─── FACULTY ──────────────────────────────────────────────────────────────────
app.get('/api/faculty', (req, res) => {
  const faculty = db.users.filter(u => u.role === 'faculty');
  res.json(faculty.map(({ password: _, ...f }) => f));
});

app.post('/api/faculty', (req, res) => {
  const { name, id, email, phone, department } = req.body;
  if (!name || !id || !email || !phone || !department)
    return res.status(400).json({ error: 'All fields required' });
  if (db.users.find(u => u.id === id))
    return res.status(400).json({ error: 'Faculty ID already exists' });
  const faculty = { id, name, email, phone, department, role: 'faculty', password: 'faculty123', subjects: [] };
  db.users.push(faculty);
  const { password: _, ...safe } = faculty;
  res.json({ success: true, faculty: safe });
});

// ─── SUBJECTS ─────────────────────────────────────────────────────────────────
app.get('/api/subjects', (req, res) => res.json(db.subjects));

app.post('/api/subjects', (req, res) => {
  const { code, name, semester, department, facultyId } = req.body;
  if (!code || !name || !semester || !department)
    return res.status(400).json({ error: 'All fields required' });
  if (db.subjects.find(s => s.code === code))
    return res.status(400).json({ error: 'Subject code already exists' });
  const faculty = facultyId ? db.users.find(u => u.id === facultyId) : null;
  const subject = { code, name, semester: +semester, department, facultyId: facultyId || null, facultyName: faculty ? faculty.name : 'TBD' };
  db.subjects.push(subject);
  if (faculty) {
    const fi = db.users.findIndex(u => u.id === facultyId);
    if (!db.users[fi].subjects.includes(code)) db.users[fi].subjects.push(code);
  }
  res.json({ success: true, subject });
});

app.put('/api/subjects/:code', (req, res) => {
  const idx = db.subjects.findIndex(s => s.code === req.params.code);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  const faculty = req.body.facultyId ? db.users.find(u => u.id === req.body.facultyId) : null;
  db.subjects[idx] = { ...db.subjects[idx], ...req.body, facultyName: faculty ? faculty.name : db.subjects[idx].facultyName };
  res.json({ success: true, subject: db.subjects[idx] });
});

app.delete('/api/subjects/:code', (req, res) => {
  const idx = db.subjects.findIndex(s => s.code === req.params.code);
  if (idx === -1) return res.status(404).json({ error: 'Subject not found' });
  db.subjects.splice(idx, 1);
  res.json({ success: true });
});

// ─── MARKS ────────────────────────────────────────────────────────────────────
app.get('/api/marks', (req, res) => {
  const { studentId, subjectCode, facultyId } = req.query;
  let marks = db.marks;
  if (studentId) marks = marks.filter(m => m.studentId === studentId);
  if (subjectCode) marks = marks.filter(m => m.subjectCode === subjectCode);
  if (facultyId) marks = marks.filter(m => m.enteredBy === facultyId);
  const enriched = marks.map(m => {
    const student = db.users.find(u => u.id === m.studentId);
    const subject = db.subjects.find(s => s.code === m.subjectCode);
    return { ...m, average: calcAvg(m.ia1, m.ia2, m.ia3), result: calcAvg(m.ia1, m.ia2, m.ia3) >= 40 ? 'Pass' : 'Fail', studentName: student?.name || 'Unknown', subjectName: subject?.name || m.subjectCode };
  });
  res.json(enriched);
});

app.get('/api/marks/:studentId', (req, res) => {
  const marks = db.marks.filter(m => m.studentId === req.params.studentId);
  const enriched = marks.map(m => {
    const subject = db.subjects.find(s => s.code === m.subjectCode);
    const avg = calcAvg(m.ia1, m.ia2, m.ia3);
    return { ...m, average: avg, result: avg >= 40 ? 'Pass' : 'Fail', subjectName: subject?.name || m.subjectCode };
  });
  res.json(enriched);
});

app.post('/api/marks', (req, res) => {
  const { studentId, subjectCode, ia1, ia2, ia3, enteredBy } = req.body;
  if (!studentId || !subjectCode || ia1 === undefined || ia2 === undefined || ia3 === undefined)
    return res.status(400).json({ error: 'All fields required' });
  for (const [k, v] of Object.entries({ ia1, ia2, ia3 }))
    if (+v < 0 || +v > 100) return res.status(400).json({ error: `${k} must be 0-100` });

  const existing = db.marks.findIndex(m => m.studentId === studentId && m.subjectCode === subjectCode);
  const record = { studentId, subjectCode, ia1: +ia1, ia2: +ia2, ia3: +ia3, enteredBy, updatedAt: new Date().toISOString() };
  if (existing >= 0) db.marks[existing] = record;
  else db.marks.push(record);
  const avg = calcAvg(ia1, ia2, ia3);
  res.json({ success: true, marks: { ...record, average: avg, result: avg >= 40 ? 'Pass' : 'Fail' } });
});

// ─── ANALYTICS ───────────────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  const students = db.users.filter(u => u.role === 'student');
  const totalMarks = db.marks.length;
  const enriched = db.marks.map(m => ({ ...m, average: calcAvg(m.ia1, m.ia2, m.ia3) }));

  const subjectStats = db.subjects.map(s => {
    const sMarks = enriched.filter(m => m.subjectCode === s.code);
    const avg = sMarks.length ? (sMarks.reduce((a, m) => a + m.average, 0) / sMarks.length).toFixed(1) : 0;
    const pass = sMarks.filter(m => m.average >= 40).length;
    return { code: s.code, name: s.name, avgScore: +avg, students: sMarks.length, pass, fail: sMarks.length - pass };
  });

  const topStudents = students.map(s => {
    const sm = enriched.filter(m => m.studentId === s.id);
    const overall = sm.length ? (sm.reduce((a, m) => a + m.average, 0) / sm.length).toFixed(1) : 0;
    return { id: s.id, name: s.name, overall: +overall, subjects: sm.length };
  }).sort((a, b) => b.overall - a.overall).slice(0, 5);

  const atRisk = students.filter(s => {
    const sm = enriched.filter(m => m.studentId === s.id);
    return sm.some(m => m.average < 40);
  }).map(s => { const { password: _, ...safe } = s; return safe; });

  res.json({ totalStudents: students.length, totalSubjects: db.subjects.length, totalFaculty: db.users.filter(u => u.role === 'faculty').length, totalMarksEntered: totalMarks, subjectStats, topStudents, atRisk });
});

// ─── REPORTS ─────────────────────────────────────────────────────────────────
app.get('/api/reports', (req, res) => {
  const { type, semester, subjectCode } = req.query;
  let report = [];

  if (type === 'student' || !type) {
    const students = db.users.filter(u => u.role === 'student' && (!semester || u.semester === +semester));
    report = students.map(s => {
      const marks = db.marks.filter(m => m.studentId === s.id).map(m => {
        const subj = db.subjects.find(sub => sub.code === m.subjectCode);
        const avg = calcAvg(m.ia1, m.ia2, m.ia3);
        return { subjectCode: m.subjectCode, subjectName: subj?.name || m.subjectCode, ia1: m.ia1, ia2: m.ia2, ia3: m.ia3, average: avg, result: avg >= 40 ? 'Pass' : 'Fail' };
      });
      const overall = marks.length ? (marks.reduce((a, m) => a + m.average, 0) / marks.length).toFixed(1) : 'N/A';
      return { studentId: s.id, studentName: s.name, department: s.department, semester: s.semester, marks, overallAverage: overall };
    });
  }

  res.json(report);
});

// ─── SERVE FRONTEND ──────────────────────────────────────────────────────────
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || 'development';
app.listen(PORT, () => {
  console.log(`\n🚀 IA Management System running at http://localhost:${PORT}`);
  console.log(`   Mode: ${ENV}`);
  console.log(`   MongoDB URI: ${process.env.MONGO_URI || '(not set — using in-memory)'}\n`);
});
