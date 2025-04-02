import mongoose from 'mongoose';
import CommandLocation from '../model/Schema/commandLocation.Schema.js';
import { ErrorWithStatus } from '../Exception/error-with-status.exception.js';
export const createLocation = async (name, code) => {
  // 1. Input sanitization
  const sanitizedName = name.trim();
  const sanitizedCode = code.toUpperCase().trim();

  // 2. Case-insensitive duplicate check (with collation index)
  const existing = await CommandLocation.findOne(
    {
      $or: [
        { name: sanitizedName }, // Exact match with collation
        { code: sanitizedCode },
      ],
    },
    null,
    { collation: { locale: 'en', strength: 2 } }
  ).lean();

  if (existing) {
    throw new ErrorWithStatus(
      existing.name.toLowerCase() === sanitizedName.toLowerCase()
        ? 'Location name already exists'
        : 'Location code already exists',
      409
    );
  }

  // 3. Create with sanitized data
  const newLocation = await CommandLocation.create({
    name: sanitizedName,
    code: sanitizedCode,
  });

  return {
    message: 'Location created successfully',
    data: {
      _id: newLocation._id,
      name: newLocation.name,
      code: newLocation.code,
    },
  };
};

export const getLocations = async (page = 1, limit = 10) => {
  const validatedPage = Math.max(1, parseInt(page));
  const validatedLimit = Math.min(50, Math.max(1, parseInt(limit)));

  const [data, total] = await Promise.all([
    CommandLocation.find({})
      .sort({ name: 1 })
      .skip((validatedPage - 1) * validatedLimit)
      .limit(validatedLimit)
      .lean(),
    CommandLocation.countDocuments(),
  ]);

  return {
    data,
    pagination: {
      currentPage: validatedPage,
      totalPages: Math.ceil(total / validatedLimit),
      totalItems: total,
      itemsPerPage: validatedLimit,
    },
  };
};

export const updateLocation = async (id, updates) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ErrorWithStatus('Invalid location ID', 400);
  }

  if (Object.keys(updates).length === 0) {
    throw new ErrorWithStatus('No updates provided', 400);
  }

  if (updates.name) updates.name = updates.name.trim();
  if (updates.code) updates.code = updates.code.toUpperCase().trim();

  // Check for duplicate names (using collation)
  if (updates.name) {
    const existing = await CommandLocation.findOne({
      _id: { $ne: id },
      name: updates.name,
    }).collation({ locale: 'en', strength: 2 });

    if (existing) {
      throw new ErrorWithStatus('Location name already exists', 409);
    }
  }

  const location = await CommandLocation.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!location) throw new ErrorWithStatus('Location not found', 404);
  return location;
};

export const deleteLocation = async (id) => {
  const result = await CommandLocation.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new ErrorWithStatus(
      'Command location not found or already deleted',
      404
    );
  }
  return { success: true, message: 'Command location deleted successfully' };
};
