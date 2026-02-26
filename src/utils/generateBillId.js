import Bill from "../models/Bill.model.js";

const generateBillId = async (receiverCode) => {
  const count = await Bill.countDocuments({ receiverCode });
  const next = String(count + 1).padStart(5, "0");
  return `${receiverCode}-${next}`; // R-00001 / W-00002 / A-00001
};

export default generateBillId;
