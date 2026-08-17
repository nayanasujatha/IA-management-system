// db.js — MongoDB Connection using Mongoose
// Run: npm install mongoose dotenv

require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ia_system';
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${uri}`);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('   Falling back to in-memory storage.');
  }
};

module.exports = connectDB;
