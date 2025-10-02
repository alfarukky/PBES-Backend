import nodemailer from 'nodemailer';

// Nodemailer configuration using Gmail service
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465, // Standard port for SSL
  secure: true, // Use `true` for port 465
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

// Verify transporter connection (optional but recommended)
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Default mail options
const defaultMailOptions = {
  from: `${process.env.NODEMAILER_EMAIL}`, // Use your Gmail address here
  replyTo: `info@wmtech.cc`,
  subject: 'WMTech',
};

// Function to send a verification email
export const sendVerificationEmail = async (name, email, password, token) => {
  try {
    const mailOptions = {
      ...defaultMailOptions,
      to: email,
      subject: 'Thank You for Registering - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">Email Confirmation</h1>
          <h2 style="color: #555;">Hello ${name}</h2>
          <p><strong>Temporary Password:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">${password}</code></p>
          <p>Please change your password after logging in for the first time.</p>
          <p>To complete your registration, please verify your email by clicking the link below within 20 minutes:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.VIRTUAL_HOST}/api/auth/verify-email/${token}" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Your Email
            </a>
          </div>
          <p>If you did not receive this email or the link has expired, you can request a new verification email <a href="${process.env.VIRTUAL_HOST}/api/auth/resend-verification-email">here</a>.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p>This email is auto-generated. Please do not reply to this email.</p>
            <p>If you didn't request this account, please contact support immediately.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', email);
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw new Error('Failed to send verification email');
  }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (name, email, token) => {
  try {
    const mailOptions = {
      ...defaultMailOptions,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">Password Reset</h1>
          <h2 style="color: #555;">Hello ${name}</h2>
          <p>You have requested to reset your password. Please click on the following link to reset your password within 15 minutes:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.VIRTUAL_HOST}/api/auth/reset-password/${token}" 
               style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Your Password
            </a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #666; font-size: 14px;">
            <p>This email is auto-generated. Please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
