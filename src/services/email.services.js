import nodemailer from 'nodemailer';

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: 465,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'b345886dc90de8',
    pass: process.env.SMTP_PASS || '6cffb13e7535ba',
  },
});

// Default mail options
const defaultMailOptions = {
  from: `WMTech <noreply.wmtech.cc>`,
  replyTo: `info@wmtech.cc`,
  subject: 'WMTech',
};

// Function to send a verification email
export const sendVerificationEmail = async (name, email, password, token) => {
  try {
    const mailOptions = { ...defaultMailOptions };
    mailOptions.to = email;
    mailOptions.subject = 'Thank You for Registering';
    mailOptions.html = `
      <h1>Email Confirmation</h1>
      <h2>Hello ${name}</h2>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p>Please change your password after logging in for the first time.</p>
      <p>To complete your registration, please verify your email by clicking the link below within 20 minutes:</p>
      <a href="${process.env.VIRTUAL_HOST}/api/auth/verify-email/${token}">Click here</a>
       <p>If you did not receive this email or the link has expired, you can request a new verification email <a href="${process.env.VIRTUAL_HOST}/api/auth/resend-verification-email">here</a>.</p>
      <p>This email is auto-generated. Please do not reply to this email.</p>
      <p>If you didn't request this account, please contact support immediately.</p>
    `;

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.err('Error sending verification email:', err);
    throw new Error('Failed to send verification email');
  }
};

// src/services/email.services.js
export const sendPasswordResetEmail = async (name, email, token) => {
  try {
    const mailOptions = { ...defaultMailOptions };
    mailOptions.to = email;
    mailOptions.subject = 'Password Reset Request';
    mailOptions.html = `
      <h1>Password Reset</h1>
      <h2>Hello ${name}</h2>
      <p>You have requested to reset your password. Please click on the following link to reset your password within 15 minutes:</p>
      <a href="${process.env.VIRTUAL_HOST}/api/auth/reset-password/${token}">Click here to reset your password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This email is auto-generated. Please do not reply to this email.</p>
    `;

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
