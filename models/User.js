// models/User.js — Mongoose Model for all users

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id:         { type: String, required: true, unique: true, trim: true },
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true },
  phone:      { type: String, required: true },
  department: { type: String, required: true },
  role:       { type: String, enum: ['admin', 'faculty', 'student'], required: true },
  password:   { type: String, required: true },

  // Student-only fields
  semester:   { type: Number },

  // Faculty-only fields
  subjects:   [{ type: String }],  // array of subject codes

}, { timestamps: true });

// Remove password from JSON output
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
