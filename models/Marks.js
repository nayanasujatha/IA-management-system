// models/Marks.js — Mongoose Model for IA Marks

const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  studentId:   { type: String, required: true },
  subjectCode: { type: String, required: true },
  ia1:         { type: Number, required: true, min: 0, max: 100 },
  ia2:         { type: Number, required: true, min: 0, max: 100 },
  ia3:         { type: Number, required: true, min: 0, max: 100 },
  average:     { type: Number },
  result:      { type: String, enum: ['Pass', 'Fail'] },
  enteredBy:   { type: String },   // Faculty ID
}, { timestamps: true });

// Auto-calculate average and result before saving
MarksSchema.pre('save', function (next) {
  this.average = parseFloat(((this.ia1 + this.ia2 + this.ia3) / 3).toFixed(2));
  this.result  = this.average >= 40 ? 'Pass' : 'Fail';
  next();
});

// Compound unique index: one marks record per student per subject
MarksSchema.index({ studentId: 1, subjectCode: 1 }, { unique: true });

module.exports = mongoose.model('Marks', MarksSchema);
