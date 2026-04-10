import AppError from '../utils/AppError.js';

/**
 * Zod validation middleware factory.
 * Validates req.body against the provided Zod schema.
 *
 * Usage: validate(loginSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );

      throw new AppError(
        `Validation failed: ${errorMessages.join('; ')}`,
        400
      );
    }

    // Replace body with parsed (and potentially transformed) data
    req.body = result.data;
    next();
  };
};

export default validate;
