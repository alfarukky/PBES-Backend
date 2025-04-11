import mongoose from 'mongoose';
const declarationSchema = new mongoose.Schema(
  {
    // Header fields
    modelOfDeclaration: { type: String, required: true },
    office: { type: String, required: true },
    customsReferenceNumber: { type: String, unique: true, required: true },
    assessmentSerial: String,
    receiptNumber: String,
    //totalPackages: { type: Number, required: true, min: 1 },
    totalItems: { type: Number, required: true, min: 1 },
    totalGrossMass: { type: Number, required: true, min: 0 },
    totalNetMass: { type: Number, required: true, min: 0 },
    representativeName: { type: String, required: true },

    // Names & Parties
    passportNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: String,
    email: String,
    nationality: { type: String, required: true },
    address: { type: String, required: true },
    //declarantCode: { type: String, required: true },
    //declarantNameAddress: { type: String, required: true },

    // Transport fields
    countryOfDeparture: { type: String, required: true },
    motRegistrationNumber: {
      type: String,
      required: true,
      min: 5,
    },
    modeOfTransport: {
      type: String,
      required: true,
      enum: ['AIR', 'LAND', 'SEA'],
      default: 'AIR', // This ensures required validation works properly with enum
    },

    departureDate: Date,
    arrivalDate: Date,

    // Financial
    modeOfPayment: { type: String, required: true },
    bankName: { type: String, required: true },
    bankCode: { type: String, required: true },
    bankBranch: { type: String, required: true },
    bankFileNumber: String,
    //valuationNote: String,
    invoiceValue: { type: Number, required: true, min: 0 },

    // Items
    items: [
      {
        itemNo: { type: Number, required: true, min: 1 },
        commodityCode: { type: String, required: true },
        commodityDescription: { type: String, required: true },
        itemDescription: String,
        countryOfOrigin: { type: String, required: true },
        packageNumber: { type: Number, required: true, min: 1 },
        packageKind: { type: String, required: true },
        grossMass: { type: Number, required: true, min: 0 },
        netMass: { type: Number, required: true, min: 0 },
        itemValue: { type: Number, required: true, min: 0 },
        procedureCode: { type: String, required: true },
        supplementaryUnit: String,
        supplementaryValue1: String,
        supplementaryValue2: String,
      },
    ],

    // Assessment
    status: {
      type: String,
      enum: ['PENDING', 'ASSESED', 'PAID', 'SEIZED', 'CANCELLED', 'CLEARED'],
      default: 'PENDING',
    },
    //assessment Fields
    // assessmentOffice: String,
    // declarantReferenceNumber: String,
    // assessmentCustomsReferenceNumber: String,
    // // companyDetails: String,
    // assessmentReceiptNumber: String,

    // System fields
    commandLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommandLocation',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    channel: {
      type: String,
      enum: ['GREEN', 'RED'],
      default: 'GREEN',
    },
    paymentDetails: {
      amountPaid: { type: Number, default: 0 },
      paymentDate: Date,
      paymentMethod: {
        type: String,
        enum: ['CASH', 'CARD', 'BANK-TRANSFER', 'OTHERS'],
      },
      transactionReference: String,
    },
    clearanceDetails: {
      exitPassNumber: String,
      clearanceDate: Date,
      clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    seizureDetails: {
      reason: String,
      seizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      seizureDate: Date,
    },
    cancellationDetails: {
      reason: String,
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      cancellationDate: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);
// Ensure these are added to your schema:
declarationSchema.index({ createdBy: 1 });
declarationSchema.index({ commandLocation: 1 });
declarationSchema.index({ status: 1 });
declarationSchema.index({ commandLocation: 1, status: 1 });
// declarationSchema.index({ passportNumber: 1 });
// declarationSchema.index({ createdAt: -1 });
// declarationSchema.index({ 'paymentDetails.paymentDate': 1 });

export default mongoose.model('Declaration', declarationSchema);
