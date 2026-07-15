const ApiError = require("../utils/ApiError");
const { ZodError } = require("zod");

/**
 * Middleware to validate request body against a Zod schema
 * @param {import("zod").ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      
      return next(new ApiError("Validation Error", 400, errorMessages));
    }
    next(error);
  }
};

module.exports = { validate };
