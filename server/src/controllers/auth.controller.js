const User = require("../modules/users/user.model");
const ApiError = require("../utils/ApiError");

const { generateToken } = require("../utils/jwt");

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken({ id: user._id, role: user.role });

  const options = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: {
      token,
      user: user.toJSON(),
    },
  });
};

exports.registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash: password,
      role: "CUSTOMER",
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.registerPharmacy = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Create user for pharmacy owner
    const user = await User.create({
      fullName,
      email,
      phone,
      passwordHash: password,
      role: "PHARMACY",
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return next(new ApiError("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ApiError("Invalid credentials", 401));
    }

    // Check if active
    if (!user.isActive) {
      return next(new ApiError("User account is suspended", 403));
    }

    // Update lastLoginAt
    user.lastLoginAt = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  res.clearCookie("token");

  res.status(200).json({
    success: true,
    data: {},
  });
};
