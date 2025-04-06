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

  // 3. Prepare system fields
  const declarationData = {
    ...formData,
    commandLocation,
    createdBy: userId,
    lastModifiedBy: userId,
    status: 'PENDING', // Default status
    channel: formData.channel || 'GREEN', // Default to green channel

    // Initialize subdocuments safely
    paymentDetails: {
      amountPaid: 0,
      ...formData.paymentDetails,
    },
    clearanceDetails: formData.clearanceDetails || {},
    seizureDetails: formData.seizureDetails || {},
    cancellationDetails: formData.cancellationDetails || {},
  };
  // 4. Create declaration
  const newDeclaration = await Declaration.create(declarationData);
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
