// models/Subject.js — Mongoose Model for Subjects

const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, trim: true, uppercase: true },
  name:        { type: String, required: true, trim: true },
  semester:    { type: Number, required: true, min: 1, max: 8 },
  department:  { type: String, required: true, trim: true },
  facultyId:   { type: String, default: null },
  facultyName: { type: String, default: 'TBD' },
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
