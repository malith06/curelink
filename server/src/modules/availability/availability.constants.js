/**
 * Medicine availability status constants
 * Used to indicate the general stock status of a medicine at a pharmacy
 * without exposing exact prices or public quantities.
 */
const AVAILABILITY_STATUS = {
  AVAILABLE: 'AVAILABLE',
  LIMITED: 'LIMITED',
  UNAVAILABLE: 'UNAVAILABLE',
  CONFIRMATION_REQUIRED: 'CONFIRMATION_REQUIRED',
};

const AVAILABILITY_STATUS_ARRAY = Object.values(AVAILABILITY_STATUS);

module.exports = {
  AVAILABILITY_STATUS,
  AVAILABILITY_STATUS_ARRAY,
};
