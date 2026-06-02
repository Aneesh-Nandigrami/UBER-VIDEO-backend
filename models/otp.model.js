const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      index: { expires: 0 }, // Auto-delete after expiry
    },

    verified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const otpModel = mongoose.model("OTP", otpSchema);

module.exports = otpModel;
