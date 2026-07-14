const express = require("express");
const {
  registerCustomer,
  registerPharmacy,
  login,
  getMe,
  logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register-customer", registerCustomer);
router.post("/register-pharmacy", registerPharmacy);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", logout);

module.exports = router;
