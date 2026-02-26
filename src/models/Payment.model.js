import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: { type: String, required: true },

    amount: { type: Number, required: true },

    paymentMode: {
      type: String,
      enum: ["ONLINE", "CASH"],
      required: true,
    },

    transactionId: String,

    screenshot: String,

    // 🔥 which owner account was used
    paymentProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentProfile",
      required: false, // ✅ IMPORTANT FIX
    },

    receiverCode: {
      type: String,
      required: true, // keep required true (we always send it)
    },

    billId: String, // after approval

    year: { type: Number, required: true },
    status: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID"],
      default: "UNPAID",
    },

    verifiedAt: Date,
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
