import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema(
  {
    assessmentNumber: {
      type: String,
      required: true,
      unique: true,
      // match: [/^[A-Z]{2}-[0-9]{6}$/, 'Format: XX-999999'],
    },

    // Relationships (Unchanged)
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: true,
    },
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transport',
      required: true,
    },
    goods: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Goods' }],
    commandLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommandLocation',
      required: true,
    },

    // Financials (Enhanced)
    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    itemTaxes: [
      {
        cost: Number,
        designation: String,
        value: Number,
      },
    ],
    globalTaxes: [
      {
        cost: Number,
        designation: String,
        value: Number,
      },
    ],

    // Workflow (Unchanged)
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Approved', 'Paid', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now },
        notes: String,
      },
    ],

    // Payment & Tracking (Enhanced)
    paymentReference: {
      type: String,
      unique: true, // Ensure uniqueness
      sparse: true, // Allows `null` values while enforcing uniqueness
      //match: [/^[A-Z0-9-]+$/, 'Alphanumeric and hyphens only'],
    },
    modeOfPayment: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque', 'Other'],
      default: 'Cash',
    },
    //exitNoticeNumber: String,

    // Audit Trail (Unchanged)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
  },
  {
    timestamps: true, // Replaces manual createdAt/updatedAt
  }
);

// Pre-save hook for status tracking
assessmentSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory = this.statusHistory || [];
    this.statusHistory.push({
      status: this.status,
      changedBy: this._updatedBy || null, // Fallback to null
      notes: this._statusChangeNotes || '', // Fallback to empty string
      changedAt: new Date(), // Explicit timestamp
    });
  }
  next();
});

export default mongoose.model('Assessment', assessmentSchema);

//  * Pre-save hook to track status changes in the assessment document.
//  *
//  * This middleware runs before the document is saved and checks if the `status` field has been modified.
//  * If there is a change, it logs the new status in the `statusHistory` array along with:
//  * - `changedBy`: The user who made the change (must be set manually before saving).
//  * - `notes`: Any additional details about the change (must be set manually before saving).
//  * - `changedAt`: The timestamp when the change occurred (automatically added).
//  *
//  * IMPORTANT IMPLEMENTATION NOTES:
//  * - The `changedBy` value (`this._updatedBy`) **must be set in the controller** before saving.
//  * - The `notes` value (`this._statusChangeNotes`) should also be provided in the controller if necessary.
//  * - If `changedBy` is not set, it will default to `null`, which may not be useful for tracking.
//  *
//  * Example Usage in Controller:
//  * ```js
//  * assessment._updatedBy = req.user._id;  // Set the user who changed the status
//  * assessment._statusChangeNotes = "Approved by admin";  // Set optional notes
//  * await assessment.save();  // Trigger pre-save hook
