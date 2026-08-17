// utils/email.js — Email sender using Nodemailer
// Run: npm install nodemailer

require('dotenv').config();
const nodemailer = require('nodemailer');

// ── Create transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Verify connection on startup ──────────────────────────────────────────
const verifyEmailConnection = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email not configured. Set EMAIL_USER and EMAIL_PASS in .env');
    return false;
  }
  try {
    await transporter.verify();
    console.log('✅ Email service connected:', process.env.EMAIL_USER);
    return true;
  } catch (err) {
    console.error('❌ Email connection failed:', err.message);
    return false;
  }
};

// ── Generic send function ─────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email send failed:', err.message);
    return { success: false, error: err.message };
  }
};

// ── Welcome email (on student registration) ───────────────────────────────
const sendWelcomeEmail = async (student) => {
  return sendEmail({
    to: student.email,
    subject: '🎓 Welcome to IA Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #7c6af7;">Welcome, ${student.name}!</h2>
        <p>Your student account has been created successfully.</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c6af7;">
          <p><strong>Student ID:</strong> ${student.id}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Department:</strong> ${student.department}</p>
          <p><strong>Semester:</strong> ${student.semester}</p>
          <p><strong>Default Password:</strong> student123</p>
        </div>
        <p style="color: #888; font-size: 13px;">Please change your password after first login.</p>
        <p>Login at: <a href="http://localhost:${process.env.PORT || 3000}">IA Management System</a></p>
      </div>
    `,
    text: `Welcome ${student.name}! Your Student ID: ${student.id}, Password: student123`,
  });
};

// ── Marks notification email ──────────────────────────────────────────────
const sendMarksEmail = async (student, subject, marks) => {
  const avg    = ((marks.ia1 + marks.ia2 + marks.ia3) / 3).toFixed(2);
  const result = avg >= 40 ? 'PASS ✅' : 'FAIL ❌';
  const color  = avg >= 40 ? '#22c55e' : '#ef4444';

  return sendEmail({
    to: student.email,
    subject: `📊 IA Marks Updated — ${subject.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #7c6af7;">IA Marks Updated</h2>
        <p>Hello <strong>${student.name}</strong>, your marks for <strong>${subject.name}</strong> have been entered.</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${color};">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; text-align: left;">Subject</th>
              <th style="padding: 8px;">IA1</th>
              <th style="padding: 8px;">IA2</th>
              <th style="padding: 8px;">IA3</th>
              <th style="padding: 8px;">Average</th>
              <th style="padding: 8px;">Result</th>
            </tr>
            <tr>
              <td style="padding: 8px;">${subject.name}</td>
              <td style="padding: 8px; text-align: center;">${marks.ia1}</td>
              <td style="padding: 8px; text-align: center;">${marks.ia2}</td>
              <td style="padding: 8px; text-align: center;">${marks.ia3}</td>
              <td style="padding: 8px; text-align: center; font-weight: bold;">${avg}</td>
              <td style="padding: 8px; text-align: center; color: ${color}; font-weight: bold;">${result}</td>
            </tr>
          </table>
        </div>
        <p style="color: #888; font-size: 13px;">Login to view all your marks and performance charts.</p>
      </div>
    `,
    text: `Your marks for ${subject.name}: IA1=${marks.ia1}, IA2=${marks.ia2}, IA3=${marks.ia3}, Average=${avg}, Result=${result}`,
  });
};

// ── Password reset email ──────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, newPassword) => {
  return sendEmail({
    to: user.email,
    subject: '🔐 Your IA System Password Has Been Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #7c6af7;">Password Reset</h2>
        <p>Hello <strong>${user.name}</strong>, your password has been reset by the admin.</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f76a8c;">
          <p><strong>Your ID:</strong> ${user.id}</p>
          <p><strong>New Password:</strong> <span style="font-family: monospace; background: #f0f0f0; padding: 2px 8px; border-radius: 4px;">${newPassword}</span></p>
        </div>
        <p style="color: #e11d48; font-size: 13px;">⚠️ Please change your password immediately after logging in.</p>
      </div>
    `,
    text: `Your new password is: ${newPassword}. Please change it after login.`,
  });
};

// ── Report email (admin) ──────────────────────────────────────────────────
const sendReportEmail = async (adminEmail, reportSummary) => {
  return sendEmail({
    to: adminEmail || process.env.ADMIN_EMAIL,
    subject: `📋 IA Report — ${new Date().toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 30px; border-radius: 10px;">
        <h2 style="color: #7c6af7;">IA System Report</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <div style="background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Total Students:</strong> ${reportSummary.totalStudents}</p>
          <p><strong>Total Subjects:</strong> ${reportSummary.totalSubjects}</p>
          <p><strong>Marks Entered:</strong> ${reportSummary.totalMarksEntered}</p>
          <p><strong>Pass Count:</strong> ${reportSummary.passCount}</p>
          <p><strong>Fail Count:</strong> ${reportSummary.failCount}</p>
        </div>
        <p style="color: #888; font-size: 13px;">Login to the admin panel to download the full CSV report.</p>
      </div>
    `,
    text: `IA Report: ${JSON.stringify(reportSummary)}`,
  });
};

module.exports = {
  verifyEmailConnection,
  sendEmail,
  sendWelcomeEmail,
  sendMarksEmail,
  sendPasswordResetEmail,
  sendReportEmail,
};
