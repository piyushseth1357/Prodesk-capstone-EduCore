const { ZodError } = require('zod');

/**
 * Zod validation middleware for Express routes.
 * Validates req.body against a Zod schema.
 * Returns HTTP 400 Bad Request with standardized error details if validation fails.
 */
const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          status: 'fail',
          error: 'Bad Request - Validation Error',
          message: 'Invalid payload submitted',
          details: formattedErrors
        });
      }
      next(error);
    }
  };
};

module.exports = validateRequest;
