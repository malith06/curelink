const express = require('express');
const { protect, authorize } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate');
const medicineController = require('./medicine.controller');
const { createMedicineSchema, updateMedicineSchema } = require('./medicine.validation');

const router = express.Router();

// Public routes
router.get('/', medicineController.getMedicines);
router.get('/:id', medicineController.getMedicineById);

// Admin only routes
router.use(protect, authorize('ADMIN'));

router.post('/', validate(createMedicineSchema), medicineController.createMedicine);
router.patch('/:id', validate(updateMedicineSchema), medicineController.updateMedicine);
router.delete('/:id', medicineController.deleteMedicine);

module.exports = router;
