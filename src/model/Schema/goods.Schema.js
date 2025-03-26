import mongoose from 'mongoose';

const goodsSchema = new mongoose.Schema(
  {
    // Core Identification
    itemNo: {
      type: String,
      required: true,
      //index: true,
    },

    // Customs-Specific Fields (DB-validated)
    commodityCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => /^[0-9]{4}\.[0-9]{2}$/.test(v),
        message: 'Invalid HS Code format (XXXX.XX)',
      },
    },

    // Descriptive Fields (Joi-validated)
    description: {
      type: String,
      required: true,
      trim: true,
    },
    countryOfOrigin: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    grossMassKg: {
      type: Number,
      required: true,
      min: [0.01, 'Gross mass must be at least 0.01 kg'],
      validate: {
        validator: Number.isFinite,
        message: 'Gross mass must be a valid number',
      },
    },
    netMassKg: {
      type: Number,
      required: true,
      min: [0, 'Net mass cannot be negative'],
      validate: {
        validator: function (v) {
          if (!Number.isFinite(this.grossMassKg)) return true;
          return v <= this.grossMassKg;
        },
        message: function (props) {
          return `Net mass (${props.value}) cannot exceed gross mass (${this.grossMassKg})`;
        },
      },
    },

    packageNumber: Number,
    packageKind: String,

    invoiceValue: {
      type: Number,
      required: true,
      min: [0, 'Invoice value cannot be negative'],
    },

    // System References
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
// Indexes
// goodsSchema.index({ assessment: 1 }); // All items for an assessment
// goodsSchema.index({ commodityCode: 1 }); // HS code reporting
// goodsSchema.index({ createdBy: 1 }); // Faster lookup by user
export default mongoose.model('Goods', goodsSchema);
