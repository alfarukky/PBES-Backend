import mongoose from 'mongoose';

const commandLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^[A-Z0-9-]+$/,
        'Code must contain only letters, numbers, and hyphens',
      ],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 }, // Apply collation at schema level
  }
);

export default mongoose.model('CommandLocation', commandLocationSchema);
