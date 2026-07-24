const MedicineRequest = require('./request.model');
const Medicine = require('../medicines/medicine.model');
const Pharmacy = require('../pharmacies/pharmacy.model');
const { REQUEST_STATUS } = require('./request.constants');
const ApiError = require('../../utils/ApiError');

/**
 * Builds a snapshot of a medicine's current state to be embedded in a request item.
 * @param {Object} medicine - The Medicine Mongoose document
 * @returns {Object} The snapshot object
 */
const buildMedicineSnapshot = (medicine) => {
  return {
    genericName: medicine.genericName,
    brandName: medicine.brandName,
    strength: medicine.strength,
    dosageForm: medicine.dosageForm
  };
};

/**
 * Calculates whether a request requires a prescription based on its items.
 * @param {Array} items - Array of request items
 * @returns {Boolean} True if any item requires a prescription
 */
const calculatePrescriptionRequirement = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return false;
  return items.some(item => item.requiresPrescription === true);
};

/**
 * Creates a new draft medicine request for a customer.
 * @param {String} customerId - The ID of the customer
 * @returns {Promise<Object>} The newly created draft request
 */
const createDraftRequest = async (customerId) => {
  const request = new MedicineRequest({
    customerId,
    items: [],
    status: REQUEST_STATUS.DRAFT
  });
  
  await request.save();
  return request;
};

/**
 * Adds a medicine item to an existing draft request.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer (for ownership check)
 * @param {Object} itemData - The item data to add
 * @returns {Promise<Object>} The updated request
 */
const addItemToRequest = async (requestId, customerId, itemData) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  if (!request) {
    throw new ApiError(404, 'Request not found or unauthorized');
  }
  if (request.status !== REQUEST_STATUS.DRAFT) {
    throw new ApiError(400, 'Cannot modify a non-draft request');
  }

  const medicine = await Medicine.findById(itemData.medicineId);
  if (!medicine) {
    throw new ApiError(404, 'Medicine not found');
  }

  const existingItemIndex = request.items.findIndex(
    item => item.medicineId.toString() === itemData.medicineId.toString()
  );

  if (existingItemIndex > -1) {
    // Merge quantity for duplicate medicines
    request.items[existingItemIndex].quantity += itemData.quantity || 1;
    if (itemData.notes) {
      request.items[existingItemIndex].notes = itemData.notes;
    }
  } else {
    // Add new item
    const snapshot = buildMedicineSnapshot(medicine);
    request.items.push({
      ...itemData,
      medicineSnapshot: snapshot,
      requiresPrescription: medicine.requiresPrescription
    });
  }

  request.requiresPrescription = calculatePrescriptionRequirement(request.items);
  await request.save();
  
  return request;
};

/**
 * Updates an item's quantity or notes in a draft request.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @param {String} medicineId - The ID of the medicine to update
 * @param {Object} updateData - Data containing quantity and/or notes
 * @returns {Promise<Object>} The updated request
 */
const updateRequestItem = async (requestId, customerId, medicineId, updateData) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  if (!request) {
    throw new ApiError(404, 'Request not found or unauthorized');
  }
  if (request.status !== REQUEST_STATUS.DRAFT) {
    throw new ApiError(400, 'Cannot modify a non-draft request');
  }

  const existingItemIndex = request.items.findIndex(
    item => item.medicineId.toString() === medicineId.toString()
  );

  if (existingItemIndex === -1) {
    throw new ApiError(404, 'Item not found in request');
  }

  if (updateData.quantity !== undefined) {
    request.items[existingItemIndex].quantity = updateData.quantity;
  }
  if (updateData.notes !== undefined) {
    request.items[existingItemIndex].notes = updateData.notes;
  }

  await request.save();
  return request;
};

/**
 * Removes an item from a draft request.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @param {String} medicineId - The ID of the medicine to remove
 * @returns {Promise<Object>} The updated request
 */
const removeRequestItem = async (requestId, customerId, medicineId) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  if (!request) {
    throw new ApiError(404, 'Request not found or unauthorized');
  }
  if (request.status !== REQUEST_STATUS.DRAFT) {
    throw new ApiError(400, 'Cannot modify a non-draft request');
  }

  const existingItemIndex = request.items.findIndex(
    item => item.medicineId.toString() === medicineId.toString()
  );

  if (existingItemIndex === -1) {
    throw new ApiError(404, 'Item not found in request');
  }

  request.items.splice(existingItemIndex, 1);
  request.requiresPrescription = calculatePrescriptionRequirement(request.items);

  await request.save();
  return request;
};

/**
 * Submits a draft request to the selected pharmacies.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @param {Array<String>} pharmacyIds - Array of pharmacy IDs to send the request to
 * @param {Object} [customerLocation] - Optional customer location object
 * @returns {Promise<Object>} The submitted request
 */
const submitRequest = async (requestId, customerId, pharmacyIds, customerLocation) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  if (!request) {
    throw new ApiError(404, 'Request not found or unauthorized');
  }
  if (request.status !== REQUEST_STATUS.DRAFT) {
    throw new ApiError(400, 'Only draft requests can be submitted');
  }
  if (request.items.length === 0) {
    throw new ApiError(400, 'Cannot submit an empty request');
  }
  if (request.requiresPrescription && !request.prescriptionId) {
    throw new ApiError(400, 'A prescription is required for one or more items in this request');
  }

  if (!pharmacyIds || pharmacyIds.length === 0) {
    throw new ApiError(400, 'At least one pharmacy must be selected');
  }

  // Validate pharmacies exist and are verified
  const pharmacies = await Pharmacy.find({
    _id: { $in: pharmacyIds },
    verificationStatus: 'VERIFIED'
  });

  if (pharmacies.length !== pharmacyIds.length) {
    throw new ApiError(400, 'One or more selected pharmacies are invalid or not verified');
  }

  request.selectedPharmacyIds = pharmacyIds;
  request.status = REQUEST_STATUS.PENDING;
  request.submittedAt = new Date();
  
  if (customerLocation) {
    request.customerLocation = customerLocation;
  }
  
  // Set expiration to 24 hours from submission
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  request.expiresAt = expiresAt;

  await request.save();
  return request;
};

/**
 * Gets all requests for a customer, optionally filtered by status
 * @param {String} customerId - The ID of the customer
 * @param {Object} filters - Query filters (e.g., status)
 * @returns {Promise<Array>} List of requests
 */
const getCustomerRequests = async (customerId, filters = {}) => {
  const query = { customerId };
  if (filters.status) {
    query.status = filters.status;
  }
  
  return MedicineRequest.find(query)
    .sort({ createdAt: -1 })
    .populate('selectedPharmacyIds', 'name address city')
    .lean();
};

/**
 * Gets details of a specific request for a customer
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @returns {Promise<Object>} The request details
 */
const getCustomerRequestById = async (requestId, customerId) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId })
    .populate('selectedPharmacyIds', 'name address phone city')
    .lean();
    
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  
  return request;
};

/**
 * Gets inbox requests for a pharmacy
 * @param {String} pharmacyId - The ID of the pharmacy
 * @param {Object} filters - Query filters (e.g., status)
 * @returns {Promise<Array>} List of requests
 */
const getPharmacyInbox = async (pharmacyId, filters = {}) => {
  const query = { selectedPharmacyIds: pharmacyId };
  if (filters.status) {
    query.status = filters.status;
  } else {
    query.status = { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.QUOTED, REQUEST_STATUS.CONFIRMED] };
  }
  
  return MedicineRequest.find(query)
    .sort({ submittedAt: -1 })
    .populate('customerId', 'name') // We only need basic customer info
    .lean();
};

/**
 * Gets details of a specific request for a pharmacy, ensuring they can't see competitors.
 * @param {String} requestId - The ID of the request
 * @param {String} pharmacyId - The ID of the pharmacy
 * @returns {Promise<Object>} The request details
 */
const getPharmacyRequestById = async (requestId, pharmacyId) => {
  const request = await MedicineRequest.findOne({ 
    _id: requestId, 
    selectedPharmacyIds: pharmacyId 
  })
    .populate('customerId', 'name')
    .lean();
    
  if (!request) {
    throw new ApiError(404, 'Request not found or not assigned to this pharmacy');
  }

  // Security Rule: Strip out other selected pharmacies
  delete request.selectedPharmacyIds;
  
  return request;
};

/**
 * Cancels a request by the customer.
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @param {String} [reason] - Optional reason for cancellation
 * @returns {Promise<Object>} The cancelled request
 */
const cancelCustomerRequest = async (requestId, customerId, reason) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }
  
  if (request.status === REQUEST_STATUS.CANCELLED || request.status === REQUEST_STATUS.COMPLETED) {
    throw new ApiError(400, `Cannot cancel a request that is already ${request.status.toLowerCase()}`);
  }
  
  request.status = REQUEST_STATUS.CANCELLED;
  request.cancelledAt = new Date();
  request.cancelledBy = customerId;
  if (reason) {
    request.cancellationReason = reason;
  }
  
  await request.save();
  return request;
};

/**
 * Allows a pharmacy to provide a quotation for a request.
 * @param {String} requestId - The ID of the request
 * @param {String} pharmacyId - The ID of the pharmacy
 * @param {Object} quotationData - Quotation details
 * @returns {Promise<Object>} The updated request
 */
const providePharmacyQuotation = async (requestId, pharmacyId, quotationData) => {
  const request = await MedicineRequest.findOne({ 
    _id: requestId, 
    selectedPharmacyIds: pharmacyId 
  });
  
  if (!request) {
    throw new ApiError(404, 'Request not found or not assigned to this pharmacy');
  }
  
  const invalidStatuses = [REQUEST_STATUS.CANCELLED, REQUEST_STATUS.EXPIRED, REQUEST_STATUS.CONVERTED_TO_ORDER];
  if (invalidStatuses.includes(request.status)) {
    throw new ApiError(400, `Cannot provide a quotation for a request that is ${request.status.toLowerCase()}`);
  }

  // Check if pharmacy already provided a quotation
  const existingQuoteIndex = request.quotations.findIndex(q => q.pharmacyId.toString() === pharmacyId.toString());
  if (existingQuoteIndex !== -1) {
    throw new ApiError(400, 'Pharmacy has already provided a quotation for this request');
  }

  let totalAmount = 0;
  const quoteItems = [];

  for (const item of quotationData.items) {
    const originalItem = request.items.id(item.requestItemId);
    if (!originalItem) {
      throw new ApiError(400, `Item ${item.requestItemId} does not exist in the request`);
    }

    const subTotal = (item.unitPrice || 0) * (item.availableQuantity || 0);
    totalAmount += subTotal;
    
    quoteItems.push({
      requestItemId: item.requestItemId,
      availabilityStatus: item.availabilityStatus,
      availableQuantity: item.availableQuantity,
      unitPrice: item.unitPrice,
      subTotal
    });
  }

  request.quotations.push({
    pharmacyId,
    items: quoteItems,
    totalAmount,
    notes: quotationData.notes,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // Default valid for 24 hours
  });

  if (request.status === REQUEST_STATUS.SUBMITTED) {
    request.status = REQUEST_STATUS.QUOTATIONS_RECEIVED;
  }

  await request.save();
  return request;
};

/**
 * Customer accepts a specific quotation
 * @param {String} requestId - The ID of the request
 * @param {String} quotationId - The ID of the quotation to accept
 * @param {String} customerId - The ID of the customer
 * @returns {Promise<Object>} The updated request
 */
const acceptQuotation = async (requestId, quotationId, customerId) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  if (request.status !== REQUEST_STATUS.QUOTATIONS_RECEIVED) {
    throw new ApiError(400, `Cannot accept quotation for a request in ${request.status.toLowerCase()} status`);
  }

  const quotation = request.quotations.id(quotationId);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (quotation.validUntil && new Date() > quotation.validUntil) {
    throw new ApiError(400, 'Quotation has expired');
  }

  request.status = REQUEST_STATUS.QUOTATION_ACCEPTED;
  
  // Accept the selected quote and decline the rest
  request.quotations.forEach(q => {
    if (q._id.toString() === quotationId.toString()) {
      q.status = 'ACCEPTED';
    } else {
      q.status = 'DECLINED';
    }
  });

  await request.save();
  return request;
};

/**
 * Customer declines a specific quotation
 * @param {String} requestId - The ID of the request
 * @param {String} quotationId - The ID of the quotation to decline
 * @param {String} customerId - The ID of the customer
 * @returns {Promise<Object>} The updated request
 */
const declineQuotation = async (requestId, quotationId, customerId) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  if (request.status !== REQUEST_STATUS.QUOTATIONS_RECEIVED) {
    throw new ApiError(400, `Cannot decline quotation for a request in ${request.status.toLowerCase()} status`);
  }

  const quotation = request.quotations.id(quotationId);
  if (!quotation) {
    throw new ApiError(404, 'Quotation not found');
  }

  if (quotation.status !== 'PENDING') {
    throw new ApiError(400, `Quotation is already ${quotation.status.toLowerCase()}`);
  }

  quotation.status = 'DECLINED';
  
  await request.save();
  return request;
};

/**
 * Customer processes payment for an accepted quotation
 * @param {String} requestId - The ID of the request
 * @param {String} customerId - The ID of the customer
 * @param {Object} paymentDetails - Mock payment details
 * @returns {Promise<Object>} The updated request
 */
const processPaymentForRequest = async (requestId, customerId, paymentDetails = {}) => {
  const request = await MedicineRequest.findOne({ _id: requestId, customerId });
  
  if (!request) {
    throw new ApiError(404, 'Request not found');
  }

  if (request.status !== REQUEST_STATUS.QUOTATION_ACCEPTED) {
    throw new ApiError(400, `Cannot process payment for a request in ${request.status.toLowerCase()} status`);
  }

  // Mock payment processing logic here...
  
  request.status = REQUEST_STATUS.CONVERTED_TO_ORDER;
  
  await request.save();
  return request;
};

module.exports = {
  buildMedicineSnapshot,
  calculatePrescriptionRequirement,
  createDraftRequest,
  addItemToRequest,
  updateRequestItem,
  removeRequestItem,
  submitRequest,
  getCustomerRequests,
  getCustomerRequestById,
  getPharmacyInbox,
  getPharmacyRequestById,
  cancelCustomerRequest,
  providePharmacyQuotation,
  acceptQuotation,
  declineQuotation,
  processPaymentForRequest
};
