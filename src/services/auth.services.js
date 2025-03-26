import bcrypt from 'bcrypt';
import User from '../model/Schema/user.Schema.js';
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
  // Check if all fields are provided
  if (!serviceNumber || !name || !email || !password || !role) {
    throw new ErrorWithStatus('All fields are required', 400);
  }

  /// Role creation hierarchy validation
  switch (loggedInUserRole) {
    case 'SuperAdmin':
      if (role !== 'Admin') {
        throw new ErrorWithStatus(
          'SuperAdmin can only create Admin users',
          403
        );
      }
      break;

    case 'Admin':
      if (!['OperationalOfficer', 'CancellationOfficer'].includes(role)) {
        throw new ErrorWithStatus(
          'Admins can only create OperationalOfficer or CancellationOfficer users',
          403
        );
      }
      break;

    case 'OperationalOfficer':
    case 'CancellationOfficer':
      throw new ErrorWithStatus('You are not authorized to create users', 403);
      break;

    default:
      throw new ErrorWithStatus('Invalid user role', 400);
  }

  // Command location validation for officer roles
  if (
    ['OperationalOfficer', 'CancellationOfficer'].includes(role) &&
    !commandLocation
  ) {
    throw new ErrorWithStatus(
      'Command location is required for officer roles',
      400
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ serviceNumber }, { email }],
  });
  if (existingUser) {
    throw new ErrorWithStatus('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate email verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationTokenExpires = Date.now() + 20 * 60 * 1000; // 20 minutes

  /// Create new user
  const newUser = new User({
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
    emailVerificationTokenExpires,
  });

  await newUser.save();

  // Populate commandLocation details
  const userWithLocation = await User.findById(newUser._id)
    .populate('commandLocation', 'name code')
    .lean(); // Convert to plain JS object

  // Send verification email
  await sendVerificationEmail(name, email, emailVerificationToken);

  return {
    message:
      'User created successfully. Please check your email to verify your account.',
    data: {
      id: userWithLocation._id,
      serviceNumber: userWithLocation.serviceNumber,
      name: userWithLocation.name,
      email: userWithLocation.email,
      role: userWithLocation.role,
      ...(userWithLocation.commandLocation && {
        commandLocation: {
          name: userWithLocation.commandLocation.name,
          code: userWithLocation.commandLocation.code,
        },
      }),
    },
  };
};

export const loginUser = async (serviceNumber, password) => {
  const user = await User.findOne({ serviceNumber })
    .populate('commandLocation', 'name code') // Fetch commandLocation details
    .lean();

  if (!user) {
    throw new ErrorWithStatus('User not found', 404);
  }

  // Check if the user is verified
  if (!user.verified) {
    throw new ErrorWithStatus(
      'Please verify your email before logging in.',
      403
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ErrorWithStatus('Username or Password is invalid', 400);
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  const token = jwt.sign(
    { role: user.role, email: user.email, id: user._id },
    JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  return {
    message: 'Login successful',
    data: {
      accessToken: token,
      user: {
        id: user._id,
        name: user.name,
        serviceNumber: user.serviceNumber,
        role: user.role,
        email: user.email,
        ...(user.commandLocation && {
          commandLocation: {
            name: user.commandLocation.name,
            code: user.commandLocation.code,
          },
        }),
      },
    },
  };
};

export const verifyEmail = async (token) => {
  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    throw new ErrorWithStatus('Invalid or expired token', 400);
  }

  if (user.emailVerificationTokenExpires < Date.now()) {
    throw new ErrorWithStatus('Token has expired', 400);
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { verified: true },
      $unset: { emailVerificationToken: 1, emailVerificationTokenExpires: 1 },
    }
  );

  return { message: 'Email verified successfully' };
};

export const resendVerificationEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorWithStatus('User not found', 404);
  }

  if (user.verified) {
    throw new ErrorWithStatus('Email already verified', 400);
  }

  // Generate a new verification token
  const emailVerificationToken = generateVerificationToken();
  const emailVerificationTokenExpires = Date.now() + 20 * 60 * 1000; // 20 minutes

  // Update the user with the new token
  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerificationToken, emailVerificationTokenExpires } }
  );

  // Send the new verification email
  await sendVerificationEmail(user.name, user.email, emailVerificationToken);

  return { message: 'Verification email sent successfully' };
};

// Forgot password
export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ErrorWithStatus('User not found', 404);
  }

  // Generate a password reset token
  const passwordResetToken = generatePasswordResetToken();
  const passwordResetTokenExpires = Date.now() + 20 * 60 * 1000; // 20 minutes

  // Update the user with the reset token
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordResetToken, passwordResetTokenExpires } }
  );

  // Send the password reset email
  await sendPasswordResetEmail(user.name, user.email, passwordResetToken);

  return { message: 'Password reset email sent successfully' };
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() }, // Check if the token is still valid
  });

  if (!user) {
    throw new ErrorWithStatus('Invalid or expired token', 400);
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password and clear the reset token
  await User.updateOne(
    { _id: user._id },
    {
      $set: { password: hashedPassword },
      $unset: { passwordResetToken: 1, passwordResetTokenExpires: 1 },
    }
  );

  return { message: 'Password reset successfully' };
};
