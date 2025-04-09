import Joi from 'joi';

// // Common validation patterns
// const ALPHANUMERIC_SPACE = /^[a-zA-Z0-9\s\-.,()]+$/;
// const NUMERIC_ID = /^[A-Z0-9-]+$/;
// const CURRENCY = /^\d+(\.\d{1,2})?$/;

// Item sub-schema
const itemSchema = Joi.object({
  itemNo: Joi.number().integer().min(1).required(),
  commodityCode: Joi.string().trim().required(),
  commodityDescription: Joi.string().trim().required(),
  countryOfOrigin: Joi.string().trim().required(),
  packageNumber: Joi.number().integer().min(1).required(),
  packageKind: Joi.string().trim().required(),
  grossMass: Joi.number().min(0).required(),
  netMass: Joi.number().min(0).required(),
  invoiceValue: Joi.number().min(0).required(),
  procedureCode: Joi.string().trim().optional(),
  supplementaryUnit: Joi.string().trim().optional(),
  supplementaryValue1: Joi.string().trim().optional(),
  supplementaryValue2: Joi.string().trim().optional(),
});

// Payment details sub-schema
// const paymentDetailsSchema = Joi.object({
//   amountPaid: Joi.number().min(0).default(0).precision(2),
//   paymentDate: Joi.date().optional(),
//   paymentMethod: Joi.string()
//     .valid('CASH', 'CARD', 'BANK-TRANSFER', 'OTHER')
//     .optional(),
//   transactionReference: Joi.string().trim().optional(),
// });

// Main declaration schema
export const createDeclarationSchema = Joi.object({
  // Header fields
  modelOfDeclaration: Joi.string().trim().required(),
  office: Joi.string().trim().required(),
  customsReferenceNumber: Joi.string().trim().optional(),
  assessmentSerial: Joi.string().trim().optional(),
  receiptNumber: Joi.string().trim().optional(),
  // totalPackages: Joi.number().integer().min(1).required(), // Removed to match Mongoose schema
  totalItems: Joi.number().integer().min(1).required(),
  totalGrossMass: Joi.number().min(0).required(),
  totalNetMass: Joi.number().min(0).required(),
  representativeName: Joi.string().trim().required(),

  // Names & Parties
  passportNumber: Joi.string().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  nationality: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  // declarantCode: Joi.string().trim().required(), // Removed to match Mongoose schema
  // declarantNameAddress: Joi.string().trim().required(), // Removed to match Mongoose schema

  // Transport fields
  countryOfDeparture: Joi.string().trim().required(), // Changed from countryOfExport
  motRegistrationNumber: Joi.string().trim().min(5).required(),
  modeOfTransport: Joi.string().valid('AIR', 'LAND').required(),
  modeOfTransportNumber: Joi.string().trim().min(5).required(),
  modeOfTransportSeatNumber: Joi.string().trim().min(1).required(),
  departureDate: Joi.date().required(),
  arrivalDate: Joi.date().required(),

  // Financial
  modeOfPayment: Joi.string().trim().required(), // Changed from termsOfPayment
  bankName: Joi.string().trim().required(),
  bankCode: Joi.string().trim().required(),
  bankBranch: Joi.string().trim().required(),
  bankFileNumber: Joi.string().trim().optional(),
  // valuationNote: Joi.string().trim().optional(), // Removed to match Mongoose schema
  invoiceValue: Joi.number().min(0).required(),

  // Items
  items: Joi.array().min(1).items(itemSchema).required(),

  // // Assessment
  // assessmentOffice: Joi.string().trim().optional(),
  // declarantReferenceNumber: Joi.string().trim().optional(),
  // assessmentCustomsReferenceNumber: Joi.string().trim().optional(),
  // companyDetails: Joi.string().trim().optional(),
  // assessmentReceiptNumber: Joi.string().trim().optional(),

 
  channel: Joi.string()
    .valid('GREEN', 'RED')
    .uppercase()
    .default('GREEN')
    .optional(),

  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'BANK-TRANSFER', 'OTHER')
    .uppercase()
    .optional(),
}).options({ stripUnknown: true });

 // System fields (frontend shouldn't send these)
//channel: Joi.string().valid('GREEN', 'RED').default('GREEN').optional(),
//   paymentDetails: paymentDetailsSchema.default({ amountPaid: 0 }),
//   clearanceDetails: Joi.object({
//     exitPassNumber: Joi.string().trim().optional(),
//     clearanceDate: Joi.date().optional(),
//     clearedBy: Joi.string()
//       .pattern(/^[0-9a-fA-F]{24}$/)
//       .optional(),
//   }).optional(),
//   seizureDetails: Joi.object({
//     reason: Joi.string().trim().optional(),
//     seizedBy: Joi.string()
//       .pattern(/^[0-9a-fA-F]{24}$/)
//       .optional(),
//     seizureDate: Joi.date().optional(),
//   }).optional(),
//   cancellationDetails: Joi.object({
//     reason: Joi.string().trim().optional(),
//     cancelledBy: Joi.string()
//       .pattern(/^[0-9a-fA-F]{24}$/)
//       .optional(),
//     cancellationDate: Joi.date().optional(),
//   }).optional(),
// })
