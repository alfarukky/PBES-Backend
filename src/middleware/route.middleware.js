export const generateMiddleWare = (schema, part = 'body', options = {}) => {
  return (req, res, next) => {
    if (schema) {
      // Validate the specified part of the request (body, params, query, etc.)
      const { error, value } = schema.validate(req[part], {
        abortEarly: options.abortEarly || false, // Collect all errors by default
        allowUnknown: options.allowUnknown || false, // Allow unknown keys by default
        stripUnknown: options.stripUnknown || true, // Remove unknown keys by default
      });

      if (error) {
        // Format validation errors
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));

        // Log validation errors (optional)
        console.error('Validation failed:', errors);

        // Return validation errors
        return res.status(400).json({
          message: 'Validation error',
          errors,
        });
      }

      // Sanitize and update the request object
      req[part] = value;
    }
    next();
  };
};
