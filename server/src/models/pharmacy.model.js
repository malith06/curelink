const mongoose = require("mongoose");

const pharmacySchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please add a pharmacy name"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    registrationNumber: {
      type: String,
      required: [true, "Please add a pharmacy registration number"],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number cannot be longer than 20 characters"],
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
    openingHours: {
      type: String,
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    pickupAvailable: {
      type: Boolean,
      default: true,
    },
    serviceRadius: {
      type: Number, // in kilometers
      default: 5,
    },
    verificationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },
    verifiedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
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

module.exports = mongoose.model("Pharmacy", pharmacySchema);
