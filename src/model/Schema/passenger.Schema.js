import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
  {
    passportNo: {
      type: String,
      required: true,
      trim: true,
      //index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    declarantName: {
      type: String,
      trim: true,
    },
    declarantAddress: {
      type: String,
      trim: true,
    },
    // isDeclarantDifferent: {
    //   type: Boolean,
    //   default: false, // False = passenger is declarant, True = separate declarant info required
    //   index: true // Optional: Add if frequently queried
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Passenger', passengerSchema);
