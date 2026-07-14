# Database Design

## Core Collections

### Users
- `_id`, `name`, `email`, `phone`, `passwordHash`, `role` (CUSTOMER | PHARMACY | ADMIN), `isActive`, `isEmailVerified`

### Pharmacies
- `_id`, `ownerUserId`, `name`, `registrationNumber`, `address`, `location` (Point coords), `verificationStatus`, `deliveryAvailable`
- *Index*: `2dsphere` on location.

### Medicines
- `_id`, `genericName`, `brandName`, `strength`, `dosageForm`, `requiresPrescription`, `aliases[]`

### PharmacyAvailability
- `_id`, `pharmacyId`, `medicineId`, `status` (AVAILABLE | LIMITED | UNAVAILABLE | CONFIRMATION_REQUIRED)

### Prescriptions
- `_id`, `customerId`, `fileUrl`, `ocrStatus`, `rawExtractedText`, `extractedMedicines[]`, `pharmacistVerificationStatus`

### MedicineRequests
- `_id`, `customerId`, `items[]`, `prescriptionId`, `customerLocation`, `selectedPharmacyIds[]`, `status`

### Quotations
- `_id`, `requestId`, `pharmacyId`, `items[]`, `subtotal`, `deliveryFee`, `total`, `status` (SUBMITTED | ACCEPTED | REJECTED)

### Orders
- `_id`, `customerId`, `pharmacyId`, `quotationId`, `items[]`, `deliveryAddressSnapshot`, `pharmacyDetailsSnapshot`, `orderStatus`, `paymentStatus`

### Payments
- `_id`, `orderId`, `method` (CARD | COD), `amount`, `status`
