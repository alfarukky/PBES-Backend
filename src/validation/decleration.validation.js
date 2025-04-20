import Joi from 'joi';
// Item sub-schema
const itemSchema = Joi.object({
  itemNo: Joi.number().integer().min(1).required(),
  cetCode: Joi.string().trim().optional(),
  cetCodeDescription: Joi.string().trim().required(), // Additional field from Zod
  itemDescription: Joi.string().trim().optional(),
  countryOfOrigin: Joi.string().trim().required(),
  packageNumber: Joi.number().integer().min(1).required(),
  packageKind: Joi.string().trim().required(),
  grossMass: Joi.number().min(0).required(),
  netMass: Joi.number().min(0).required(),
  itemValue: Joi.number().min(0).optional(),
  levy: Joi.number().min(0).optional(),
  duty: Joi.number().min(0).optional(),
  vat: Joi.number().min(0).optional(),
  etls: Joi.number().min(0).optional(),
  ciss: Joi.number().min(0).optional(),
  surCharge: Joi.number().min(0).optional(),
  levyCharge: Joi.number().min(0).optional(),
  dutyCharge: Joi.number().min(0).optional(),
  vatCharge: Joi.number().min(0).optional(),
  totalItemValueWithTaxes: Joi.number().min(0).optional(),
  procedureCode: Joi.string().trim().optional(),
  supplementaryUnit: Joi.string().trim().optional().allow(''),
  supplementaryValue1: Joi.string().trim().optional().allow(''),
  supplementaryValue2: Joi.string().trim().optional().allow(''),
});

// Main declaration schema
export const createDeclarationSchema = Joi.object({
  // Header fields
  modelOfDeclaration: Joi.string().trim().required(),
  office: Joi.string().trim().required(),
  receiptNumber: Joi.string().trim().optional().allow(''),
  // totalPackages: Joi.number().integer().min(1).required(), // Removed to match Mongoose schema
  totalItems: Joi.number().integer().min(1).required(),
  totalGrossMass: Joi.number().min(0).required(),
  totalNetMass: Joi.number().min(0).required(),
  representativeName: Joi.string().trim().required(),

  // Names & Parties
  passportNumber: Joi.string().trim().required(),
  firstName: Joi.string().trim().required(),
  lastName: Joi.string().trim().required(),
  phoneNumber: Joi.string().trim().min(11).required(), // Added from Zod
  email: Joi.string().trim().email().required(),
  nationality: Joi.string().trim().required(),
  address: Joi.string().trim().required(),

  // Transport fields
  countryOfDeparture: Joi.string().trim().required(), // Changed from countryOfExport
  motRegistrationNumber: Joi.string().trim().min(5).required(), // Changed from motRegistrationNo
  modeOfTransport: Joi.string().valid('AIR', 'LAND', 'SEA').required(),
  departureDate: Joi.date().optional(),
  arrivalDate: Joi.date().optional(),
  motRegistrationNumber: Joi.string().trim().min(5).required(), // Changed from motRegistrationNo
  modeOfTransport: Joi.string().valid('AIR', 'LAND', 'SEA').required(),
  departureDate: Joi.date().optional(),
  arrivalDate: Joi.date().optional(),

  // Financial
  modeOfPayment: Joi.string().trim().required(), // Changed from termsOfPayment
  bankName: Joi.string().trim().required(),
  bankCode: Joi.string().trim().required(),
  bankBranch: Joi.string().trim().required(),
  bankFileNumber: Joi.string().trim().optional().allow(''), // Changed from bankFileNo
  // valuationNote: Joi.string().trim().optional(), // Removed to match Mongoose schema
  invoiceValue: Joi.number().min(0).required(),

  // Items
  items: Joi.array().min(1).items(itemSchema).required(),
  customsReferenceNumber: Joi.forbidden(), // Never allow client to set this
  assessmentSerial: Joi.forbidden(),

  status: Joi.string()
    .valid('STORED', 'ASSESSED', 'PAID', 'CANCELLED', 'CLEARED')
    .default('STORED'),

  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'BANK-TRANSFER', 'OTHER')
    .uppercase()
    .optional(),
}).options({ stripUnknown: true });

// Update schema decleration
export const updateDeclarationSchema = Joi.object({
  modelOfDeclaration: Joi.string().trim().optional(),
  office: Joi.string().trim().optional(),
  receiptNumber: Joi.string().trim().optional().allow(''),
  totalItems: Joi.number().integer().min(1).optional(),
  totalGrossMass: Joi.number().min(0).optional(),
  totalNetMass: Joi.number().min(0).optional(),
  representativeName: Joi.string().trim().optional(),

  passportNumber: Joi.string().trim().optional(),
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
  phoneNumber: Joi.string().trim().min(11).optional(),
  email: Joi.string().trim().email().optional(),
  nationality: Joi.string().trim().optional(),
  address: Joi.string().trim().optional(),

  countryOfDeparture: Joi.string().trim().optional(),
  motRegistrationNumber: Joi.string().trim().min(5).optional(),
  modeOfTransport: Joi.string().valid('AIR', 'LAND', 'SEA').optional(),
  departureDate: Joi.date().optional(),
  arrivalDate: Joi.date().optional(),

  modeOfPayment: Joi.string().trim().optional(),
  bankName: Joi.string().trim().optional(),
  bankCode: Joi.string().trim().optional(),
  bankBranch: Joi.string().trim().optional(),
  bankFileNumber: Joi.string().trim().optional().allow(''),
  invoiceValue: Joi.number().min(0).optional(),

  items: Joi.array().items(itemSchema).optional(),

  customsReferenceNumber: Joi.forbidden(),
  assessmentSerial: Joi.forbidden(),
  status: Joi.forbidden(),

  paymentMethod: Joi.string()
    .valid('CASH', 'CARD', 'BANK-TRANSFER', 'OTHER')
    .uppercase()
    .optional(),
}).options({ stripUnknown: true });
