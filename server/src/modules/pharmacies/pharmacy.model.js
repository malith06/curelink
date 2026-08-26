const mongoose = require('mongoose');
const { VERIFICATION_STATUS_ARRAY, PHARMACY_VERIFICATION_STATUS } = require('./pharmacy.constants');

const openingHourSchema = new mongoose.Schema(
  {
    isOpen: { type: Boolean, default: false },
    openTime: { type: String, default: null },
    closeTime: { type: String, default: null },
  },
  { _id: false }
);

const pharmacySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
      uppercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true, default: '' },
      city: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true, default: '' },
      country: { type: String, required: true, trim: true, default: 'Sri Lanka' },
    },
    openingHours: {
      monday: { type: openingHourSchema, default: () => ({}) },
      tuesday: { type: openingHourSchema, default: () => ({}) },
      wednesday: { type: openingHourSchema, default: () => ({}) },
      thursday: { type: openingHourSchema, default: () => ({}) },
      friday: { type: openingHourSchema, default: () => ({}) },
      saturday: { type: openingHourSchema, default: () => ({}) },
      sunday: { type: openingHourSchema, default: () => ({}) },
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    pickupAvailable: {
      type: Boolean,
      default: true,
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
    serviceRadiusKm: {
      type: Number,
      min: 1,
      max: 100,
      default: 10,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (value) {
            return Array.isArray(value) && value.length === 2;
          },
          message: 'Location must contain longitude and latitude',
        },
      },
    },
    locationUpdatedAt: {
      type: Date,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS_ARRAY,
      default: PHARMACY_VERIFICATION_STATUS.DRAFT,
    },
    verificationNote: {
      type: String,
      maxlength: 500,
      default: '',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);

// Add geospatial index for location-based search
pharmacySchema.index({ location: '2dsphere' });

module.exports = Pharmacy;
