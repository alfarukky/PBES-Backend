import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    serviceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
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
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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
    emailVerificationToken: {
      type: String,
      select: false,
      index: true,
    },
    emailVerificationTokenExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
      index: true,
    },
    passwordResetTokenExpires: {
      type: Date,
      select: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes for better query performance
userSchema.index({ verified: 1, isSuspended: 1 });
userSchema.index({ emailVerificationTokenExpires: 1 });
userSchema.index({ passwordResetTokenExpires: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.User || mongoose.model('User', userSchema);
