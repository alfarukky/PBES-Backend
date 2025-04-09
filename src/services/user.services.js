import User from '../model/Schema/user.Schema.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';

const formatUserResponse = (user) => ({
  id: user._id,
  serviceNumber: user.serviceNumber,
  name: user.name,
  email: user.email,
  role: user.role,
  verified: user.verified,
  isSuspended: user.isSuspended,
  ...(user.commandLocation && {
    commandLocation: {
      name: user.commandLocation.name,
      code: user.commandLocation.code,
    },
  }),
  createdAt: user.createdAt,
});

export const suspendUser = async (userId, requesterRole) => {
  if (!['SuperAdmin', 'Admin'].includes(requesterRole)) {
    throw new ErrorWithStatus('Unauthorized to suspend users', 403);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorWithStatus('User not found', 404);
  }

  // Prevent suspending higher-privileged users
  if (
    (requesterRole === 'Admin' &&
      ['SuperAdmin', 'Admin'].includes(user.role)) ||
    (requesterRole === 'SuperAdmin' && user.role === 'SuperAdmin')
  ) {
    throw new ErrorWithStatus('Unauthorized to suspend this user', 403);
  }

  user.isSuspended = !user.isSuspended; // Toggle suspension status
  await user.save();

  return {
    message: `User ${
      user.isSuspended ? 'suspended' : 'activated'
    } successfully`,
    data: {
      serviceNumber: user.serviceNumber,
      name: user.name,
      isSuspended: user.isSuspended,
    },
  };
};

export const getAllUsers = async (requesterRole) => {
  let query = {};

  // Filter based on requester's role
  if (requesterRole === 'Admin') {
    query.role = { $in: ['OperationalOfficer', 'CancellationOfficer'] };
  } else if (requesterRole === 'SuperAdmin') {
    query.role = {
      $in: ['Admin', 'OperationalOfficer', 'CancellationOfficer'],
    };
  } else {
    throw new ErrorWithStatus('Unauthorized to view users', 403);
  }

  const users = await User.find(query)
    .select('-password -__v -emailVerificationToken -passwordResetToken')
    .populate('commandLocation', 'name code')
    .lean();

  return users.map((user) => formatUserResponse(user));
};

export const getUserById = async (userId, requesterRole) => {
  // Only SuperAdmin can view all users, Admin can view their own users
  const query = { _id: userId };
  if (requesterRole === 'Admin') {
    query.role = { $nin: ['SuperAdmin'] };
  }

  const user = await User.findOne(query)
    .select('-password -__v -emailVerificationToken -passwordResetToken')
    .populate('commandLocation', 'name code')
    .lean();

  if (!user) {
    throw new ErrorWithStatus('User not found or unauthorized', 404);
  }

  return formatUserResponse(user);
};

export const updateUser = async (userId, userData, requesterRole) => {
  // Only SuperAdmin can update users
  if (requesterRole !== 'SuperAdmin') {
    throw new ErrorWithStatus('Only SuperAdmin can update users', 403);
  }
  // Validate required fields for PUT
  if (!userData.serviceNumber || !userData.email || !userData.role) {
    throw new ErrorWithStatus('All mandatory fields required for PUT', 400);
  }

  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new ErrorWithStatus('User not found', 404);
  }

  // Block SuperAdmin demotion
  if (existingUser.role === 'SuperAdmin' && userData.role !== 'SuperAdmin') {
    throw new ErrorWithStatus('Unauthorized to demote SuperAdmin', 403);
  }

  // Full replacement (PUT semantics)
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        serviceNumber: userData.serviceNumber,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        commandLocation: userData.commandLocation,
      },
    },
    { new: true, runValidators: true }
  )
    .select('-password -__v -emailVerificationToken -passwordResetToken')
    .populate('commandLocation', 'name code');

  return formatUserResponse(updatedUser);
};

export const deleteUser = async (userId, requesterRole) => {
  if (requesterRole !== 'SuperAdmin') {
    throw new ErrorWithStatus('Only SuperAdmin can delete users', 403);
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorWithStatus('User not found', 404);
  }

  await User.deleteOne({ _id: userId });
};
