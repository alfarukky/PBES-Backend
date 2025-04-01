import Joi from 'joi';

// Common validation patterns
const commonValidations = {
  serviceNumber: () =>
    Joi.string()
      .trim()
      .required()
      .messages({ 'string.empty': 'Service number is required' }),

  name: () =>
    Joi.string().required().min(3).max(50).messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),

  email: () =>
    Joi.string()
      .email()
      .lowercase()
      .trim()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'string.min': 'Email must be at least 3 characters long',
        'string.max': 'Email cannot exceed 255 characters',
        'any.required': 'Email is required',
      }),

  password: () =>
    Joi.string().min(6).max(255).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 255 characters',
      'any.required': 'Password is required',
    }),

  role: () =>
    Joi.string()
      .valid('SuperAdmin', 'Admin', 'OperationalOfficer', 'CancellationOfficer')
      .required()
      .messages({
        'any.only': 'Invalid role specified',
        'any.required': 'Role is required',
      }),

  commandLocation: () =>
    Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({ 'string.pattern.base': 'Invalid command location ID' }),
};

export const createUserSchema = Joi.object({
  serviceNumber: commonValidations.serviceNumber(),
  name: commonValidations.name(),
  email: commonValidations.email(),
  password: commonValidations.password(),
  role: commonValidations.role(),
  commandLocation: Joi.when('role', {
    is: Joi.valid('OperationalOfficer', 'CancellationOfficer'),
    then: commonValidations.commandLocation().required().messages({
      'any.required': 'Command location is required for this role',
    }),
    otherwise: Joi.forbidden(),
  }),
});

export const userQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({ 'number.min': 'Page must be at least 1' }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  role: commonValidations.role().optional(),
  isSuspended: Joi.boolean().optional(),
  verified: Joi.boolean().optional(),
  search: Joi.string().trim().optional(),
});
