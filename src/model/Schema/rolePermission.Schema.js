import mongoose from 'mongoose';

const rolePermissionSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['SuperAdmin', 'Admin', 'Officer'], // Roles are defined here
    required: true,
    unique: true,
  },
  permissions: {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    manageUsers: { type: Boolean, default: false },
  },
});

export default mongoose.model('RolePermission', rolePermissionSchema);
