import Bill from "../models/Bill.model.js";
import { createCanvas } from "canvas";

export const downloadBill = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findOne({ billId }).populate("studentId");
    if (!bill) return res.status(404).json({ message: "Bill not found" });

    // Canvas setup
    const width = 800;
    const height = 1000;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, width, height);

    // Top header
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, 110);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 30px Arial";
    ctx.fillText("ROYAL PG", 40, 60);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#c7d2fe";
    ctx.fillText("PAYMENT INVOICE", width - 260, 60);

    // Invoice Card
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.08)";
    ctx.shadowBlur = 20;
    ctx.fillRect(50, 150, width - 100, 680);
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "#e5e7eb";
    ctx.strokeRect(50, 150, width - 100, 680);

    // PAID Watermark
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.translate(width / 2, height / 2);
    ctx.rotate(-Math.PI / 5);
    ctx.font = "bold 160px Arial";
    ctx.fillStyle = "#16a34a";
    ctx.textAlign = "center";
    ctx.fillText("PAID", 0, 0);
    ctx.restore();

    // Section title
    ctx.fillStyle = "#020617";
    ctx.font = "bold 22px Arial";
    ctx.fillText("Bill Details", 80, 200);

    let y = 250;

    const drawRow = (label, value) => {
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#475569";
      ctx.fillText(label, 90, y);

      ctx.font = "15px Arial";
      ctx.fillStyle = "#020617";
      ctx.fillText(value || "—", 330, y);
      y += 38;
    };

    drawRow("Bill ID", bill.billId);
    drawRow("Student Name", bill.studentId.name);
    drawRow("Room", bill.roomName);
    drawRow("Building", bill.buildingName);
    drawRow("Month", bill.month);
    drawRow("Payment Mode", bill.paymentMode);
    drawRow("Transaction ID", bill.transactionId);
    drawRow("Receiver Code", bill.receiverCode);

    // Divider
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(80, y + 10);
    ctx.lineTo(width - 80, y + 10);
    ctx.stroke();

    // Amount box
    ctx.fillStyle = "#ecfeff";
    ctx.fillRect(80, y + 40, width - 160, 110);

    ctx.strokeStyle = "#22d3ee";
    ctx.strokeRect(80, y + 40, width - 160, 110);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("Total Amount Paid", 110, y + 85);

    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#16a34a";
    ctx.fillText(`₹ ${bill.amount}`, width - 300, y + 95);

    // Footer
    ctx.font = "12px Arial";
    ctx.fillStyle = "#64748b";
    ctx.fillText(
      "This is a system generated invoice. No signature required.",
      width / 2 - 180,
      height - 90,
    );

    ctx.fillText("Royal PG Management System", width / 2 - 110, height - 60);

    // Export
    const buffer = canvas.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${bill.billId}.png`,
    );
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to generate bill" });
  }
};
