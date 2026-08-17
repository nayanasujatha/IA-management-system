# IA Management System — Master File
## Complete Full-Stack Internal Assessment System

---

## FOLDER STRUCTURE

```
ia-management/
├── server.js          ← Backend: Node.js + Express API
├── package.json       ← Dependencies
├── README.md          ← This file
└── public/
    └── index.html     ← Complete Frontend (React + Chart.js + Tailwind)
```

---

## HOW TO RUN LOCALLY

### Step 1 — Install Node.js
Download from https://nodejs.org (v18+ recommended)

### Step 2 — Install dependencies
```bash
cd ia-management
npm install
```

### Step 3 — Start the server
```bash
node server.js
```

### Step 4 — Open in browser
Visit: http://localhost:3000

---

## LOGIN CREDENTIALS

| Role    | ID       | Password    |
|---------|----------|-------------|
| Admin   | admin001 | admin123    |
| Faculty | FAC001   | faculty123  |
| Faculty | FAC002   | faculty123  |
| Student | STU001   | student123  |
| Student | STU002   | student123  |
| Student | STU003–5 | student123  |

---

## FEATURES IMPLEMENTED

### 1. Student Registration ✓
- Register with: Name, ID, Email, Phone, Department, Semester
- Full CRUD (Create, Read, Update, Delete)
- Input validation on all fields

### 2. Faculty Registration ✓
- Register with: Name, ID, Email, Phone, Department
- Subject assignment tracking

### 3. Subject Management ✓
- Add, edit, delete subjects
- Assign faculty to subjects
- Filter by semester

### 4. IA Marks Entry ✓
- Faculty enters IA1, IA2, IA3 marks per student per subject
- Auto-calculates average: (IA1 + IA2 + IA3) / 3
- Inline save/update per student row
- Real-time Pass/Fail preview

### 5. Student Marks Viewing ✓
- Student login → sees own marks table
- Subject | IA1 | IA2 | IA3 | Average | Result
- Overall average displayed
- IA progress line chart

### 6. Result Calculation ✓
- Average ≥ 40 → Pass (green badge)
- Average < 40 → Fail (red badge, red row highlight)

### 7. Performance Analytics ✓
- Bar chart: Subject-wise average scores
- Pie chart: Pass vs Fail distribution
- Line chart: IA progression per subject
- Top performers table
- At-risk students list

### 8. Admin Dashboard ✓
- Total Students, Subjects, Faculty, Marks cards
- Top performing students
- At-risk students warning list
- Subject performance charts

### 9. Faculty Dashboard ✓
- Shows only faculty's own subjects
- Marks entry table per subject
- Live average preview

### 10. Student Dashboard ✓
- Profile card with overall average
- Subject-wise marks table
- IA progress line chart

### 11. Report Generation ✓
- Student-wise reports with all subject marks
- Filter by semester
- Download as CSV

### 12. Search and Filter ✓
- Search students by name or ID
- Filter by semester
- Dynamic table updates

### 13. Input Validation ✓
- Name: letters only
- Phone: minimum 10 digits
- Email: must contain @
- Student/Faculty ID: alphanumeric
- Marks: 0–100 range

### 14. Backend API Endpoints ✓
```
POST   /api/login
GET    /api/students
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id
GET    /api/faculty
POST   /api/faculty
GET    /api/subjects
POST   /api/subjects
PUT    /api/subjects/:code
DELETE /api/subjects/:code
POST   /api/marks
GET    /api/marks
GET    /api/marks/:studentId
GET    /api/analytics
GET    /api/reports
```

---

## TECH STACK

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React 18 (CDN), Tailwind CSS  |
| Charts    | Chart.js 4                    |
| Backend   | Node.js + Express             |
| Database  | In-memory JSON (no setup)     |
| Fonts     | Google Fonts (DM Sans, Space Mono) |

**Note:** Data is stored in-memory and resets when server restarts.
To persist data, replace `db` object in server.js with MongoDB (see MONGODB section below).

---

## ADDING MONGODB (Optional)

Install mongoose:
```bash
npm install mongoose
```

Add to top of server.js:
```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ia_system');

const StudentSchema = new mongoose.Schema({
  id: String, name: String, email: String,
  phone: String, department: String, semester: Number, role: String
});
const Student = mongoose.model('Student', StudentSchema);
```

Replace the in-memory array operations with Mongoose queries.

---

## MARKS FORMULA

```
Average = (IA1 + IA2 + IA3) / 3
Result  = Average >= 40 ? "Pass" : "Fail"
```

---

## PROJECT ARCHITECTURE

```
Browser (React UI)
      ↕  HTTP/JSON
Express Server (server.js)
      ↕
In-Memory DB (db object)
```

---

## ROLE-BASED ACCESS

| Feature          | Admin | Faculty | Student |
|------------------|-------|---------|---------|
| View all students| ✓     | ✗       | ✗       |
| Add/edit student | ✓     | ✗       | ✗       |
| Manage subjects  | ✓     | ✗       | ✗       |
| Enter marks      | ✓     | ✓       | ✗       |
| View own marks   | ✓     | ✗       | ✓       |
| Analytics        | ✓     | ✓       | ✓       |
| Generate reports | ✓     | ✗       | ✗       |

---

Built for educational demonstration purposes.
