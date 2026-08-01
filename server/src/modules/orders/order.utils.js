const generateCustomerSnapshot = (customer) => {
  let addressSummary = '';
  if (customer.address) {
    const parts = [
      customer.address.line1,
      customer.address.city,
      customer.address.district
    ].filter(Boolean);
    addressSummary = parts.join(', ');
  }

  return {
    customerId: customer._id,
    fullName: customer.name,
    email: customer.email,
    phone: customer.phone,
    addressSummary
  };
};

const generatePharmacySnapshot = (pharmacy) => {
  return {
    pharmacyId: pharmacy._id,
    name: pharmacy.name,
    registrationNumber: pharmacy.registrationNumber,
    phone: pharmacy.phone,
    email: pharmacy.email,
    address: {
      line1: pharmacy.address?.line1 || 'N/A',
      city: pharmacy.address?.city || 'N/A',
      district: pharmacy.address?.district || 'N/A',
      country: pharmacy.address?.country || 'Sri Lanka'
    },
    location: pharmacy.location || { type: 'Point', coordinates: [0, 0] },
    deliveryAvailable: pharmacy.deliveryAvailable || false,
    pickupAvailable: pharmacy.pickupAvailable || false
  };
};

const generateDeliveryAddressSnapshot = (addressPayload) => {
  if (!addressPayload) return null;
  return {
    fullName: addressPayload.fullName,
    phone: addressPayload.phone,
    line1: addressPayload.line1,
    line2: addressPayload.line2 || '',
    city: addressPayload.city,
    district: addressPayload.district,
    postalCode: addressPayload.postalCode || '',
    country: addressPayload.country,
    latitude: addressPayload.latitude,
    longitude: addressPayload.longitude
  };
};

const mapQuotationItemsToOrderItems = (quotationItems) => {
  let subtotal = 0;
  const items = quotationItems.map(item => {
    // Determine approved quantity based on availability
    const approvedQuantity = item.availabilityResult === 'AVAILABLE' || item.availabilityResult === 'SUBSTITUTION_OFFERED' 
      ? item.quantity 
      : 0;

    const itemSubtotal = approvedQuantity * item.unitPrice;
    subtotal += itemSubtotal;

    return {
      requestItemId: item.requestItemId,
      quotationItemId: item._id,
      medicineId: item.medicineId,
      medicineSnapshot: item.medicineSnapshot,
      requestedQuantity: item.quantity,
      approvedQuantity,
      unitPrice: item.unitPrice,
      subtotal: itemSubtotal,
      availabilityResult: item.availabilityResult,
      substitutionOffered: item.substitutionOffered,
      substitutionMedicineId: item.substitutionMedicineId,
      substitutionSnapshot: item.substitutionSnapshot,
      substitutionNote: item.substitutionNote,
      customerAcknowledgementRequired: item.substitutionOffered
    };
  });

  return { items, subtotal };
};

module.exports = {
  generateCustomerSnapshot,
  generatePharmacySnapshot,
  generateDeliveryAddressSnapshot,
  mapQuotationItemsToOrderItems
};
