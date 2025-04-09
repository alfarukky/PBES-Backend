import { randomBytes } from 'crypto';

export const generateVerificationToken = () => {
  return randomBytes(20).toString('hex'); // Generate a 20-byte random string in hexadecimal format
};

// Generate a password reset token
export const generatePasswordResetToken = () => {
  return randomBytes(20).toString('hex'); // Generate a 20-byte random string in hexadecimal format
};

export const generateRandomPassword = () => {
  const length = 12;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i] % charset.length];
  }
  return password;
};
