import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true, unique: true },

    receiverCode: {
      type: String, // R / W / A
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buildingName: String,
    roomName: String,

    month: String,
    amount: Number,

    paymentMode: String,
    transactionId: String,
  },
  { timestamps: true },
);

const Bill = mongoose.model("Bill", billSchema);
export default Bill;
