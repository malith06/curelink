const { z } = require("zod");
const { VERIFICATION_STATUSES, VERIFICATION_RESULT } = require("./verification.constants");

const verifiedItemSchema = z.object({
  medicineId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid medicine ID"),
  requestItemId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid request item ID"),
  isSupportedByPrescription: z.enum(Object.values(VERIFICATION_RESULT)),
  pharmacyNotes: z.string().max(300).optional(),
});

const submitVerificationSchema = z.object({
  status: z.enum(Object.values(VERIFICATION_STATUSES)),
  verifiedItems: z.array(verifiedItemSchema).optional(),
  verificationNotes: z.string().max(500).optional(),
  rejectionReason: z.string().max(500).optional(),
}).refine(data => {
  if (data.status === VERIFICATION_STATUSES.REJECTED && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: "Rejection reason is required when status is REJECTED",
});

module.exports = {
  submitVerificationSchema,
};
