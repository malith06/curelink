const ApiError = require("../utils/ApiError");
const { ZodError } = require("zod");

/**
 * Middleware to validate request body against a Zod schema
 * @param {import("zod").ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    let innerSchema = schema;
    // Unwrap ZodEffects (refinements/transforms) by checking for innerType method
    while (innerSchema && typeof innerSchema.innerType === 'function') {
      innerSchema = innerSchema.innerType();
    }

    // Check if it's a ZodObject that expects the { body, query, params } structure
    const isFullReqSchema = innerSchema && innerSchema.shape && 
      (innerSchema.shape.body || innerSchema.shape.query || innerSchema.shape.params);

    if (isFullReqSchema) {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (validatedData.body !== undefined) req.body = validatedData.body;
      if (validatedData.query !== undefined) req.query = validatedData.query;
      if (validatedData.params !== undefined) req.params = validatedData.params;
    } else {
      req.body = schema.parse(req.body);
    }
    
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
