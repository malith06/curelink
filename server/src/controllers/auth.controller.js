const User = require("../modules/users/user.model");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const { generateToken } = require("../utils/jwt");

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
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
  
  const userData = user.toJSON();
  if (userData.role === 'PHARMACY') {
    const Pharmacy = require('../modules/pharmacies/pharmacy.model');
    const pharmacy = await Pharmacy.findOne({ ownerUserId: user._id }).lean();
    if (pharmacy) {
      userData.pharmacy = pharmacy;
    }
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    data: {
      token,
      user: userData,
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

    await sendTokenResponse(user, 201, res);
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

    await sendTokenResponse(user, 201, res);
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
    await user.save({ validateBeforeSave: false });

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const userData = user.toJSON();
    if (userData.role === 'PHARMACY') {
      const Pharmacy = require('../modules/pharmacies/pharmacy.model');
      const pharmacy = await Pharmacy.findOne({ ownerUserId: user._id }).lean();
      if (pharmacy) {
        userData.pharmacy = pharmacy;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
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

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ApiError("There is no user with that email", 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password reset token",
        message,
        html: `
          <h1>You have requested a password reset</h1>
          <p>Please click on the following link to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
        `
      });

      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ApiError("Email could not be sent", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid token", 400));
    }

    // Set new password
    user.passwordHash = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
