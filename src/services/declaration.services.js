import Declaration from '../model/Schema/declaration.Schema.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';

// Role validation constants
const ALLOWED_ROLES = ['OperationalOfficer', 'CancellationOfficer'];

const REQUIRED_FIELDS = [
  'passportNumber',
  'office',
  'items',
  'firstName',
  'lastName',
  'modeOfPayment',
];

const DECLARATION_ACCESS_RULES = {
  // Key: User Role
  // Value: Filter conditions they can apply
  OperationalOfficer: (user) => ({
    createdBy: user.id, // Only own declarations
  }),

  CancellationOfficer: (user) => ({
    commandLocation: user.commandLocation, // All in their command
  }),

  Admin: () => ({}),

  SuperAdmin: () => ({}), // No restrictions
};

function generateNextCustomRef(lastRef, year) {
  if (!lastRef?.customsReferenceNumber) {
    return `P1${year}`;
  }

  const match = lastRef.customsReferenceNumber.match(
    new RegExp(`^P(\\d+)${year}$`)
  );
  if (!match) {
    throw new ErrorWithStatus(
      `Reference number format mismatch: ${lastRef.customsReferenceNumber}`,
      400
    );
  }

  const lastSerial = parseInt(match[1], 10);
  if (isNaN(lastSerial)) {
    throw new ErrorWithStatus(
      `Invalid serial number in reference: ${lastRef.customsReferenceNumber}`,
      400
    );
  }

  if (lastSerial >= Number.MAX_SAFE_INTEGER - 1) {
    throw new ErrorWithStatus(
      'Serial number overflow: max value exceeded',
      500
    );
  }

  return `P${lastSerial + 1}${year}`;
}

export const createDeclaration = async (
  formData,
  userId,
  userRole,
  commandLocation
) => {
  // 1. Validate user role
  if (!ALLOWED_ROLES.includes(userRole)) {
    throw new ErrorWithStatus(
      'Only operational/cancellation officers can submit declarations',
      403
    );
  }

  if (!commandLocation) {
    throw new ErrorWithStatus('Command location is required', 400);
  }

  for (const field of REQUIRED_FIELDS) {
    if (!formData[field]) {
      throw new ErrorWithStatus(`${field} is required`, 400);
    }
  }

  // 2. Validate required fields
  if (!Array.isArray(formData.items) || !formData.items.length) {
    throw new ErrorWithStatus('At least one item is required', 400);
  }

  const currentYear = new Date().getFullYear();
  let attempt = 0;
  let newDeclaration;
  let lastError = null;

  while (attempt < 3) {
    try {
      const lastDeclaration = await Declaration.findOne(
        { customsReferenceNumber: { $regex: `^P\\d+${currentYear}$` } },
        { customsReferenceNumber: 1 },
        { sort: { customsReferenceNumber: -1 } }
      ).lean();

      const nextCustomsRef = generateNextCustomRef(
        lastDeclaration,
        currentYear
      );

      newDeclaration = await Declaration.create({
        ...formData,
        customsReferenceNumber: nextCustomsRef,
        commandLocation,
        createdBy: userId,
        lastModifiedBy: userId,
        status: 'PENDING',
        channel: formData.channel || 'GREEN',
        paymentDetails: {
          amountPaid: 0,
          ...formData.paymentDetails,
        },
        clearanceDetails: formData.clearanceDetails || {},
        seizureDetails: formData.seizureDetails || {},
        cancellationDetails: formData.cancellationDetails || {},
      });

      break; // Successful creation
    } catch (err) {
      lastError = err;
      if (err.code !== 11000) throw err; // Only retry on duplicate key error
      attempt++;
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100)
      );
    }
  }

  if (!newDeclaration) {
    throw new ErrorWithStatus(
      `Declaration submission failed after 3 attempts. ${
        lastError?.message || ''
      }`,
      500
    );
  }

  return {
    success: true,
    message: 'Declaration submitted successfully',
    data: newDeclaration,
  };
};

export const getDeclarations = async (user, filters = {}) => {
  if (!DECLARATION_ACCESS_RULES[user.role]) {
    throw new ErrorWithStatus(
      `User role '${user.role}' has no access permissions defined`,
      403
    );
  }

  const baseQuery = DECLARATION_ACCESS_RULES[user.role]({
    ...user,
    commandLocation: user.commandLocation?._id || user.commandLocation,
  });

  const query = {
    ...baseQuery,
    ...(filters.status && { status: filters.status }),
  };
  // 3. Execute query
  return await Declaration.find(query)
    .select('-__v -createdAt -updatedAt')
    .populate('createdBy', 'name serviceNumber')
    .populate('commandLocation', 'name code')
    .lean();
};

export const getDeclarationById = async (declarationId, user) => {
  const declaration = await Declaration.findById(declarationId)
    .populate('createdBy', 'name serviceNumber')
    .populate('commandLocation', 'name code')
    .lean();

  if (!declaration) {
    throw new ErrorWithStatus('Declaration not found', 404);
  }

  //Convert both IDs to strings for comparison
  const userLocation =
    user.commandLocation?._id?.toString() || user.commandLocation?.toString();
  const declLocation = declaration.commandLocation?._id?.toString();

  const ROLE_VALIDATORS = {
    OperationalOfficer: (decl, u) =>
      decl.createdBy._id.toString() === u.id.toString(),
    CancellationOfficer: (decl, u) => declLocation === userLocation,
    Admin: () => true,
    SuperAdmin: () => true,
  };

  if (!ROLE_VALIDATORS[user.role]?.(declaration, user)) {
    throw new ErrorWithStatus('Access denied', 403);
  }

  return declaration;
};

export const addAssessmentReference = async (
  declarationId,
  userId,
  userRole
) => {
  // Validate declaration exists
  const declaration = await Declaration.findById(declarationId);
  if (!declaration) {
    throw new ErrorWithStatus('Declaration not found', 404);
  }

  // Authorization check
  if (!['OperationalOfficer', 'CancellationOfficer'].includes(userRole)) {
    throw new ErrorWithStatus(
      'Only operational/cancellation officers can add assessment references',
      403
    );
  }

  // Business rule validation
  if (declaration.status !== 'PENDING') {
    throw new ErrorWithStatus('Only pending declarations can be updated', 400);
  }

  // Generate and validate assessment reference
  const assessmentRef = declaration.customsReferenceNumber.replace('P', 'L');

  // Check for duplicates
  const existingAssessment = await Declaration.findOne({
    assessmentSerial: assessmentRef,
    _id: { $ne: declarationId },
  });

  if (existingAssessment) {
    throw new ErrorWithStatus('Assessment reference already exists', 400);
  }

  // Update declaration
  const updatedDeclaration = await Declaration.findByIdAndUpdate(
    declarationId,
    {
      assessmentSerial: assessmentRef,
      lastModifiedBy: userId,
      status: 'ASSESED', // Optional: consider updating status if needed
    },
    { new: true }
  );

  return {
    success: true,
    message: 'Assessment reference added successfully',
    data: {
      customReference: updatedDeclaration.customsReferenceNumber,
      assessmentReference: updatedDeclaration.assessmentSerial,
      status: updatedDeclaration.status,
    },
  };
};
