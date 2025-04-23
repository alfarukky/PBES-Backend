import Declaration from '../model/Schema/declaration.Schema.js';
import { ReferenceService } from './sequence.services.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';

// Role validation constants
const MAX_RETRIES = 3;
const ALLOWED_ROLES = ['OperationalOfficer', 'CancellationOfficer'];
const DECLARATION_STATUS = {
  STORED: 'STORED',
  ASSESSED: 'ASSESSED',
  CANCELLED: 'CANCELLED',
};
const REQUIRED_FIELDS = [
  'passportNumber',
  'office',
  'items',
  'firstName',
  'lastName',
  'motRegistrationNumber',
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
  declarationData,
  userId,
  userRole,
  status,
  commandLocation
) => {
  validateInput(userRole, commandLocation, declarationData, status);

  if (status === DECLARATION_STATUS.STORED) {
    return storeDeclaration(declarationData, userId, commandLocation);
  }

  if (status === DECLARATION_STATUS.ASSESSED) {
    const data = await assessDeclarationWithRetry(
      declarationData,
      userId,
      commandLocation
    );
    return {
      success: true,
      message: 'Declaration assessed successfully',
      data,
    };
  }
};

function validateInput(userRole, commandLocation, data, status) {
  if (!ALLOWED_ROLES.includes(userRole)) {
    throw new ErrorWithStatus(
      'Only operational/cancellation officers can submit declarations',
      403
    );
  }

  if (!commandLocation) {
    throw new ErrorWithStatus('Command location is required', 400);
  }

  const missing = REQUIRED_FIELDS.filter((field) => !data[field]);
  if (missing.length) {
    throw new ErrorWithStatus(`${missing.join(', ')} is required`, 400);
  }

  if (!Array.isArray(data.items) || !data.items.length) {
    throw new ErrorWithStatus('At least one item is required', 400);
  }

  if (
    ![DECLARATION_STATUS.STORED, DECLARATION_STATUS.ASSESSED].includes(status)
  ) {
    throw new ErrorWithStatus('Status must be either STORED or ASSESSED', 400);
  }
}

async function storeDeclaration(data, userId, commandLocation) {
  const result = await Declaration.create({
    ...data,
    status: 'STORED',
    commandLocation,
    createdBy: userId,
    lastModifiedBy: userId,
  });

  return {
    success: true,
    message: 'Declaration stored successfully',
    data: result,
  };
}

async function assessDeclarationWithRetry(
  data,
  userId,
  commandLocation,
  attempt = 0
) {
  try {
    const customsRef = await ReferenceService.getNextCustomsRef();
    const assessmentSerial = await ReferenceService.getNextAssessmentSerial(
      customsRef
    );
    await ReferenceService.verifyUniqueReferences(customsRef, assessmentSerial);

    return await Declaration.create({
      ...data,
      status: 'ASSESSED',
      customsReferenceNumber: customsRef,
      assessmentSerial,
      commandLocation,
      createdBy: userId,
      lastModifiedBy: userId,
    });
  } catch (error) {
    if (error.code === 11000 && attempt < MAX_RETRIES) {
      // Randomized delay before retrying (50ms to 150ms)
      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100)
      );
      console.warn(
        `Duplicate key error (attempt ${
          attempt + 1
        }/${MAX_RETRIES}), retrying...`
      );
      return assessDeclarationWithRetry(
        data,
        userId,
        commandLocation,
        attempt + 1
      );
    }

    throw new ErrorWithStatus(
      `Assessment failed after ${attempt} attempts: ${error.message}`,
      500
    );
  }
}

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
    .lean()
    .exec();
};

export const getDeclarationById = async (declarationId, user) => {
  const declaration = await Declaration.findById(declarationId)
    .select('-__v -createdAt -updatedAt')
    .populate('createdBy', 'name serviceNumber')
    .populate('commandLocation', 'name code')
    .lean()
    .exec();

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

export const assessDeclaration = async (declarationId, userId, userRole) => {
  //authorized check
  if (!ALLOWED_ROLES.includes(userRole)) {
    throw new ErrorWithStatus(
      'Only operational/cancellation officers can assess declarations',
      403
    );
  }

  // Validate declaration exists
  const declaration = await Declaration.findById(declarationId);
  if (!declaration) {
    throw new ErrorWithStatus('Declaration not found', 404);
  }

  // Business rule validation
  if (declaration.status !== DECLARATION_STATUS.STORED) {
    throw new ErrorWithStatus('Only stored declarations can be assessed', 400);
  }

  try {
    // Generate new references
    const customsRef = await ReferenceService.getNextCustomsRef();
    const assessmentSerial = await ReferenceService.getNextAssessmentSerial(
      customsRef
    );

    // Ensure uniqueness
    await ReferenceService.verifyUniqueReferences(customsRef, assessmentSerial);

    // Update the declaration
    declaration.customsReferenceNumber = customsRef;
    declaration.assessmentSerial = assessmentSerial;
    declaration.status = 'ASSESSED';
    declaration.lastModifiedBy = userId;

    await declaration.save();

    return {
      success: true,
      message: 'Declaration assessed successfully',
      data: {
        id: declaration._id,
        customsReferenceNumber: declaration.customsReferenceNumber,
        assessmentSerial: declaration.assessmentSerial,
        status: declaration.status,
      },
    };
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorWithStatus(
        'Duplicate reference encountered. Please retry.',
        500
      );
    }
    throw new ErrorWithStatus(
      `Failed to assess declaration: ${error.message}`,
      500
    );
  }
};

export const updateDeclaration = async (
  declarationId,
  updateData,
  userId,
  userRole
) => {
  // 1. Fetch the existing declaration
  const declaration = await Declaration.findById(declarationId);
  if (!declaration) {
    throw new ErrorWithStatus('Declaration not found', 404);
  }

  // 2. Role-based authorization
  const isStored = declaration.status === DECLARATION_STATUS.STORED;
  const isAssessed = declaration.status === DECLARATION_STATUS.ASSESSED;

  if (
    (isStored && !ALLOWED_ROLES.includes(userRole)) ||
    (isAssessed && userRole !== 'CancellationOfficer')
  ) {
    throw new ErrorWithStatus(
      'You are not authorized to update this declaration',
      403
    );
  }

  // 3. Restrict fields if needed (optional security measure)
  // e.g., prevent changing status or reference numbers directly
  delete updateData.customsReferenceNumber;
  delete updateData.assessmentSerial;
  delete updateData.status;

  // 4. Apply updates
  const updatedDeclaration = await Declaration.findByIdAndUpdate(
    declarationId,
    {
      ...updateData,
      lastModifiedBy: userId,
    },
    { new: true, runValidators: true }
  );

  return {
    success: true,
    message: 'Declaration updated successfully',
    data: updatedDeclaration,
  };
};

export const cancelDeclaration = async (declarationId, userId, userRole) => {
  // Check role
  if (userRole !== 'CancellationOfficer') {
    throw new ErrorWithStatus(
      'Only cancellation officers can cancel declarations',
      403
    );
  }

  // Find the declaration
  const declaration = await Declaration.findById(declarationId);
  if (!declaration) {
    throw new ErrorWithStatus('Declaration not found', 404);
  }
  // Check if declaration can be cancelled
  if (
    ![DECLARATION_STATUS.STORED, DECLARATION_STATUS.ASSESSED].includes(
      declaration.status
    )
  ) {
    throw new ErrorWithStatus(
      'Only stored or assessed declarations can be cancelled',
      400
    );
  }
  // Update the status to CANCELLED
  const cancelDeclaration = await Declaration.findByIdAndUpdate(
    declarationId,
    {
      status: 'CANCELLED',
      lastModifiedBy: userId,
    },
    { new: true }
  );

  return {
    success: true,
    message: 'Declaration cancelled successfully',
    data: cancelDeclaration,
  };
};
