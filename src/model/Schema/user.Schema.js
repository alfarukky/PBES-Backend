import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    serviceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'SuperAdmin',
        'Admin',
        'OperationalOfficer',
        'CancellationOfficer',
      ],
      required: true,
    },
    commandLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommandLocation',
      required: function () {
        return ['OperationalOfficer', 'CancellationOfficer'].includes(
          this.role
        );
      },
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },

    verified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Add index for better query performance
// userSchema.index({ role: 1, commandLocation: 1 });
// userSchema.index({ serviceNumber: 1 }, { unique: true });
// userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
