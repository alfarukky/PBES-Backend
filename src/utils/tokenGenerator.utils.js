import crypto from 'crypto';

export const generateVerificationToken = () => {
  return crypto.randomBytes(20).toString('hex'); // Generate a 20-byte random string in hexadecimal format
};

// Generate a password reset token
export const generatePasswordResetToken = () => {
  return crypto.randomBytes(20).toString('hex'); // Generate a 20-byte random string in hexadecimal format
};
