import bcrypt from 'bcrypt';
import User from '../model/Schema/user.Schema.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';

export const createSuperAdmin = async () => {
  try {
    // Check if a Super Admin already exists
    const superAdminExists = await User.findOne({ role: 'SuperAdmin' });

    if (superAdminExists) {
      console.log('Super Admin already exists.');
      return;
    }

    // Create a new Super Admin
    const superAdmin = new User({
      serviceNumber: process.env.SUPERADMIN_serviceNumber || 'NCS1001',
      name: process.env.SUPERADMIN_NAME || 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'superadmin@gmail.com',
      password: await bcrypt.hash(
        process.env.SUPERADMIN_PASSWORD || 'password123',
        12
      ), // Stronger salt rounds
      role: 'SuperAdmin',
      verified: true,
      isSuspended: false,
      createdBy: null, // System-generated
      // Explicitly omit commandLocation as it's not needed for SuperAdmin
    });

    // Validate the SuperAdmin document before saving
    await superAdmin.validate();

    await superAdmin.save();
    console.log(
      'Super Admin created successfully with service number:',
      superAdmin.serviceNumber
    );

    return {
      success: true,
      data: {
        serviceNumber: superAdmin.serviceNumber,
        email: superAdmin.email,
        createdAt: superAdmin.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating Super Admin:', error);
    throw new ErrorWithStatus(
      `Failed to create Super Admin: ${error.message}`,
      500
    );
  }
};
