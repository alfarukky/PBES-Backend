import bcrypt from 'bcrypt';
import User from '../model/Schema/user.schema.js';
import jwt from 'jsonwebtoken';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';
import {
  generateVerificationToken,
  generatePasswordResetToken,
} from '../utils/tokenGenerator.utils.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../services/email.services.js';

// Constants
const TOKEN_EXPIRATION = 1 * 60 * 1000; // 20 minutes
const EMAIL_VERIFY_EXPIRY = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_EXPIRY = 60 * 60 * 1000; // 1 hour
const JWT_EXPIRATION = '1h';
const ROLE_CREATION_RULES = {
  SuperAdmin: ['Admin'],
  Admin: ['OperationalOfficer', 'CancellationOfficer'],
};

// Helper function for user response formatting
const formatUserResponse = (user) => ({
  id: user._id,
  serviceNumber: user.serviceNumber,
  name: user.name,
  email: user.email,
  role: user.role,
  ...(user.commandLocation && {
    commandLocation: {
      name: user.commandLocation.name,
      code: user.commandLocation.code,
    },
  }),
});

export const registerUser = async (
  serviceNumber,
  name,
  email,
  password,
  role,
  commandLocation,
  loggedInUserRole,
  createdBy
) => {
  // Validate input
  if (!serviceNumber || !name || !email || !password || !role) {
    throw new ErrorWithStatus('All fields are required', 400);
  }

  if (!ROLE_CREATION_RULES[loggedInUserRole]?.includes(role)) {
    throw new ErrorWithStatus(`${loggedInUserRole} cannot create ${role}`, 403);
  }

  if (
    ['OperationalOfficer', 'CancellationOfficer'].includes(role) &&
    !commandLocation
  ) {
    throw new ErrorWithStatus(
      'Command location is required for officer roles',
      400
    );
  }

  // Check for existing user (optimized query)
  const existingUser = await User.findOne({
    $or: [{ serviceNumber }, { email }],
  })
    .select('_id')
    .lean();
  if (existingUser) {
    throw new ErrorWithStatus('User already exists', 400);
  }

  // Create user with hashed password
  const hashedPassword = await bcrypt.hash(password, 10);
  const emailVerificationToken = generateVerificationToken();

  const newUser = await User.create({
    serviceNumber,
    name,
    email,
    password: hashedPassword,
    role,
    ...(role === 'OperationalOfficer' || role === 'CancellationOfficer'
      ? { commandLocation }
      : {}),
    createdBy,
    emailVerificationToken,
    emailVerificationTokenExpires: Date.now() + TOKEN_EXPIRATION,
  });

  // Parallelize email sending and user population
  const [userWithLocation] = await Promise.all([
    User.findById(newUser._id).populate('commandLocation', 'name code').lean(),
    sendVerificationEmail(name, email, emailVerificationToken),
  ]);

  return {
    message:
      'User created successfully. Please check your email to verify your account.',
    data: formatUserResponse(userWithLocation),
  };
};

export const loginUser = async (serviceNumber, password) => {
  const user = await User.findOne({ serviceNumber })
    .populate('commandLocation', 'name code')
    .select('+password +isSuspended')
    .lean();

  if (!user) {
    throw new ErrorWithStatus('Invalid credentials', 401);
  }

  // Check if user is suspended
  if (user.isSuspended) {
    throw new ErrorWithStatus(
      'Your account has been suspended. Please contact administrator.',
      403
    );
  }

  if (!user.verified) {
    throw new ErrorWithStatus(
      'Please verify your email before logging in',
      403
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ErrorWithStatus('Invalid credentials', 401);
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  const token = jwt.sign(
    { role: user.role, email: user.email, id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  return {
    message: 'Login successful',
    data: {
      accessToken: token,
      user: formatUserResponse(user),
    },
  };
};

export const verifyEmail = async (token) => {
  const user = await User.findOneAndUpdate(
    {
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: Date.now() },
    },
    {
      $set: { verified: true },
      $unset: {
        emailVerificationToken: '',
        emailVerificationTokenExpires: '',
      },
    },
    { new: true }
  );

  if (!user) {
    throw new ErrorWithStatus(
      'Invalid or expired verification link. Please request a new one.',
      400
    );
  }

  return {
    message: 'Email verified successfully',
    data: {
      id: user._id,
      serviceNumber: user.serviceNumber,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorWithStatus('No account found with this email address', 404);
  }

  if (user.verified) {
    throw new ErrorWithStatus('This email is already verified', 400);
  }

  const newToken = generateVerificationToken();
  const expiresAt = Date.now() + EMAIL_VERIFY_EXPIRY;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerificationToken: newToken,
        emailVerificationTokenExpires: expiresAt,
      },
    }
  );

  await sendVerificationEmail(user.name, user.email, newToken);

  return {
    message: 'New verification email sent',
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorWithStatus('No account found with this email address', 404);
  }

  const resetToken = generatePasswordResetToken();
  const expiresAt = Date.now() + PASSWORD_RESET_EXPIRY;

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetToken: resetToken,
        passwordResetTokenExpires: expiresAt,
      },
    }
  );

  await sendPasswordResetEmail(user.name, user.email, resetToken);

  return {
    message: 'Password reset link sent (valid for 1 hour)',
    expiresAt: new Date(expiresAt).toISOString(),
  };
};

export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new ErrorWithStatus(
      'This password reset link is invalid or has expired. Please request a new one.',
      400
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: hashedPassword },
      $unset: {
        passwordResetToken: '',
        passwordResetTokenExpires: '',
      },
    }
  );

  return {
    message:
      'Password updated successfully. You may now log in with your new password.',
    user: formatUserResponse(user),
  };
};
