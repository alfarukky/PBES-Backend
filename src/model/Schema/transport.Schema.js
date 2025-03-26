import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema(
  {
    countryOfExport: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    motRegistration: {
      type: String,
      required: true,
      trim: true,
      //index: true,
    },
    modeOfTransport: {
      type: String,
      enum: ['Air', 'Sea', 'Land'],
      required: true,
      trim: true,
      lowercase: true,
    },
    // flightNumber: {
    //   type: String,
    //   trim: true,
    //   required: function () {
    //     return this.modeOfTransport === 'Air';
    //   },
    //   validate: {
    //     validator: function (v) {
    //       if (this.modeOfTransport !== 'Air') return true;
    //       return v && v.trim().length > 0;
    //     },
    //     message:
    //       'Flight number is required for air transport and cannot be empty.',
    //   },
    // },
    // seatNumber: {
    //   type: String,
    //   trim: true,
    //   required: function () {
    //     return this.modeOfTransport === 'Air';
    //   },
    //   validate: {
    //     validator: function (v) {
    //       if (this.modeOfTransport !== 'Air') return true;
    //       return v && v.trim().length > 0;
    //     },
    //     message:
    //       'Seat number is required for air transport and cannot be empty.',
    //   },
    // },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Transport', transportSchema);
