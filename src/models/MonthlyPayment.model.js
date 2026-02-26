import mongoose from "mongoose";

const monthlyPaymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    month: {
      type: String,
      required: true, // January, February...
    },

    year: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID"],
      default: "UNPAID",
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true },
);

// 🔒 one student per month per year
monthlyPaymentSchema.index(
  { studentId: 1, month: 1, year: 1 },
  { unique: true },
);

const MonthlyPayment = mongoose.model("MonthlyPayment", monthlyPaymentSchema);

export default MonthlyPayment;
