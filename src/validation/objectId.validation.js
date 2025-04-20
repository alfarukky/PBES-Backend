import Joi from 'joi';

export const objectIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid ID format',
      'any.required': 'ID is required',
    }),
});

// GET /api/declarations query validation
export const declarationQuerySchema = Joi.object({
  status: Joi.string()
    .trim()
    .uppercase()
    .valid('STORED', 'ASSESSED', 'PAID', 'CANCELLED', 'CLEARED')
    .messages({
      'any.only': 'Invalid status value',
    }),
  commandLocation: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('Invalid ID format'),
}).options({ stripUnknown: true });

export const searchQuerySchema = Joi.object({
  q: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[a-zA-Z0-9\s\-\.\/]*$/, {
      name: 'alphanumeric with spaces and basic symbols',
    })
    .allow('')
    .optional(),
});
