import mongoose from 'mongoose';

// sequence.schema.js
const sequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 },
});
export default mongoose.model('Sequence', sequenceSchema);
