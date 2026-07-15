const ApiError = require("../utils/ApiError");

/**
 * Middleware to validate request body against a Zod schema
 * @param {import("zod").ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.name === "ZodError") {
      const errorMessages = error.errors.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      
      return next(new ApiError("Validation Error", 400, errorMessages));
    }
    next(error);
  }
};

module.exports = { validate };
