import Joi from 'joi';

export const createLocationSchema = Joi.object({
  name: Joi.string().trim().required().max(100).messages({
    'string.empty': 'Location name is required',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  code: Joi.string()
    .trim()
    .required()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .messages({
      'string.pattern.base':
        'Code must contain only letters, numbers, and hyphens',
    }),
});

export const updateLocationSchema = createLocationSchema
  .keys({
    name: Joi.string().trim().max(100).optional(),
    code: Joi.string()
      .trim()
      .uppercase()
      .pattern(/^[A-Z0-9-]+$/)
      .optional(),
  })
  .min(1);

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

export const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required',
    }),
});
