const { verifyToken } = require("../utils/jwt");
const User = require("../modules/users/user.model");
const ApiError = require("../utils/ApiError");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check cookies for token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Fallback to Bearer token
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ApiError("Not authorized to access this route", 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ApiError("Not authorized to access this route", 401));
    }
    
    // Check if user is active
    if (!req.user.isActive) {
      return next(new ApiError("User account is suspended", 403));
    }

    next();
  } catch (err) {
    return next(new ApiError("Not authorized to access this route", 401));
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
