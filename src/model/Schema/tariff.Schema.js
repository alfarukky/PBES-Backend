import mongoose from 'mongoose';

const tariffSchema = new mongoose.Schema(
  {
    cetCode: { type: String, required: true },
    description: { type: String, required: true },
    su: String,
    id: String,
    vat: String,
    lvy: String,
    exc: String,
    dov: String,
  },
  { timestamps: true }
);

// Create compound indexes for performance
tariffSchema.index({ cetCode: 1 });
tariffSchema.index({ description: 1 });

export default mongoose.model('Tariff', tariffSchema);
