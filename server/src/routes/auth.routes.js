const express = require("express");
const {
  registerCustomer,
  registerPharmacy,
  login,
  getMe,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../modules/auth/auth.validation");

const router = express.Router();

router.post("/register/customer", validate(registerSchema), registerCustomer);
router.post("/register/pharmacy", validate(registerSchema), registerPharmacy);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
