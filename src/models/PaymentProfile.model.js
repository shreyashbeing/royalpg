import mongoose from "mongoose";

const paymentProfileSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      enum: ["ROYAL", "WARIS", "ANISH"],
      required: true,
    },

    code: {
      type: String,
      enum: ["R", "W", "A"],
      required: true,
    },

    upiId: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    qrImage: String,

    isLive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// 🔒 only one per owner + label
paymentProfileSchema.index({ ownerId: 1, label: 1 }, { unique: true });

const PaymentProfile =
  mongoose.models.PaymentProfile ||
  mongoose.model("PaymentProfile", paymentProfileSchema);

export default PaymentProfile;
