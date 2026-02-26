import Bill from "../models/Bill.model.js";
import Counter from "../models/Counter.model.js";

export const createBill = async ({
  studentId,
  buildingName,
  roomName,
  month,
  amount,
  paymentMode,
  transactionId,
  receiverCode,
}) => {
  // 🔥 atomic increment
  const counter = await Counter.findOneAndUpdate(
    { name: "billCounter" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );

  const paddedNumber = String(counter.value).padStart(5, "0");

  const billId = `${receiverCode}-${paddedNumber}`;

  const bill = await Bill.create({
    billId,
    studentId,
    buildingName,
    roomName,
    month,
    amount,
    paymentMode,
    transactionId,
    receiverCode,
  });

  return bill;
};
