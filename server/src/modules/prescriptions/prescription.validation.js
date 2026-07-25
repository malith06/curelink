const { z } = require("zod");
const { CUSTOMER_ACTIONS } = require("./prescription.constants");

const reviewOcrEntrySchema = z.object({
  action: z.enum(Object.values(CUSTOMER_ACTIONS)),
  medicineId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid medicine ID").optional(),
  quantity: z.number().int().min(1).max(100).optional(),
  customerCorrectedName: z.string().trim().max(100).optional(),
  customerNotes: z.string().trim().max(300).optional(),
}).refine(data => {
  if (
    [CUSTOMER_ACTIONS.ACCEPTED, CUSTOMER_ACTIONS.CORRECTED, CUSTOMER_ACTIONS.MANUALLY_ADDED].includes(data.action) &&
    !data.medicineId && !data.customerCorrectedName
  ) {
    return false;
  }
  return true;
}, {
  message: "Either a valid medicine ID or a corrected name is required for this action",
});

module.exports = {
  reviewOcrEntrySchema,
};
