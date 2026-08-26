const express = require("express");
const {
  registerCustomer,
  registerPharmacy,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../modules/auth/auth.validation");

const router = express.Router();

router.post("/register/customer", validate(registerSchema), registerCustomer);
router.post("/register/pharmacy", validate(registerSchema), registerPharmacy);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.put("/reset-password/:resettoken", validate(resetPasswordSchema), resetPassword);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
