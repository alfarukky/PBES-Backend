import mongoose from 'mongoose';

const bankSchema = new mongoose.Schema(
  {
    bankCode: { type: String, required: true },
    bankName: { type: String, required: true },
    bankAddress: { type: String },
    emailAddress: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Bank', bankSchema);
