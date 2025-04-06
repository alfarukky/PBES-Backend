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

export default mongoose.model('Tariff', tariffSchema);
