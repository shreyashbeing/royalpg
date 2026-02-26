import Payment from "../models/Payment.model.js";
import Room from "../models/Room.model.js";
import User from "../models/User.model.js";
import { getIO } from "../config/socket.js";
import { createBill } from "../services/bill.service.js";
import { createNotification } from "../services/notification.service.js";
import { sendEmail } from "../config/mailer.js";
import PaymentProfile from "../models/PaymentProfile.model.js";
import { Parser } from "json2csv";

/* =========================================================
   STUDENT → CREATE PAYMENT REQUEST
   UNPAID → PENDING
========================================================= */
export const createPaymentRequest = async (req, res) => {
  try {
    const { month, year, amount, paymentMode, transactionId, receiverCode } =
      req.body;

    const ownerId = req.user.role === "OWNER" ? req.user._id : req.user.ownerId;

    if (!ownerId) {
      return res.status(400).json({
        message: "Student is not linked to any owner",
      });
    }

    let finalReceiverCode = null;
    let paymentProfileId = null;

    /* ================= ONLINE ================= */
    if (paymentMode === "ONLINE") {
      const liveProfile = await PaymentProfile.findOne({
        ownerId,
        isLive: true,
      });

      if (!liveProfile) {
        return res
          .status(400)
          .json({ message: "No live payment account set by owner" });
      }

      finalReceiverCode = liveProfile.code; // R / W / A
      paymentProfileId = liveProfile._id;
    }

    /* ================= CASH ================= */
    if (paymentMode === "CASH") {
      if (!receiverCode) {
        return res.status(400).json({ message: "Receiver required" });
      }

      finalReceiverCode = receiverCode; // ANISH / WARISH
    }

    /* ================= CREATE ================= */

    const payment = await Payment.create({
      studentId: req.user._id,
      month,
      year,
      amount,
      paymentMode,
      transactionId,
      screenshot: req.file?.path || null,
      paymentProfile: paymentProfileId,
      receiverCode: finalReceiverCode,
      status: "PENDING",
    });

    getIO().emit("paymentRequested");

    res.status(201).json({
      message: "Payment request submitted",
      payment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment request failed" });
  }
};

/* =========================================================
   OWNER → MONTHLY LEDGER
   RETURNS:
   - ALL STUDENTS ALWAYS
   - IF PAYMENT EXISTS → USE IT
   - ELSE → AUTO CREATE UNPAID ENTRY
========================================================= */
export const getAllPayments = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year required",
      });
    }

    /* 🔥 GET ALL ACTIVE STUDENTS OF THIS OWNER */
    const students = await User.find({
      role: "STUDENT",
      ownerId: req.user._id,
      status: "ACTIVE",
    }).select("-password");

    /* 🔥 GET EXISTING PAYMENTS FOR SELECTED MONTH */
    const payments = await Payment.find({
      month,
      year: Number(year),
    }).populate("studentId");

    /* 🔥 CREATE PAYMENT MAP */
    const paymentMap = {};

    payments.forEach((p) => {
      if (p.studentId) {
        paymentMap[p.studentId._id.toString()] = p;
      }
    });

    /* 🔥 BUILD MONTHLY LEDGER */
    const ledger = students.map((student) => {
      const existing = paymentMap[student._id.toString()];

      if (existing) {
        return {
          ...existing.toObject(),
          studentId: student,
        };
      }

      return {
        _id: `${student._id}-${month}-${year}`,
        studentId: student,
        month,
        year: Number(year),
        amount: 0,
        paymentMode: null,
        receiverCode: null,
        transactionId: null,
        billId: null,
        status: "UNPAID",
      };
    });

    res.json(ledger);
  } catch (err) {
    console.error("LEDGER ERROR:", err);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
};
/* =========================================================
   STUDENT → HISTORY
========================================================= */
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.user._id,
    }).sort({ year: -1, createdAt: -1 });

    res.json(payments);
  } catch {
    res.status(500).json({ message: "Failed to fetch my payments" });
  }
};

/* =========================================================
   OWNER → VERIFY PAYMENT
========================================================= */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!["PAID", "UNPAID"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const payment = await Payment.findById(paymentId).populate("studentId");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    payment.verifiedAt = status === "PAID" ? new Date() : null;

    /* APPROVED */
    if (status === "PAID") {
      const student = payment.studentId;

      let buildingName = "N/A";
      let roomName = "N/A";

      if (student?.roomId) {
        const room = await Room.findById(student.roomId).populate("buildingId");
        if (room) {
          roomName = room.roomName;
          buildingName = room.buildingId?.name || "N/A";
        }
      }

      const bill = await createBill({
        studentId: student._id,
        buildingName,
        roomName,
        month: payment.month,
        amount: payment.amount,
        paymentMode: payment.paymentMode,
        transactionId: payment.transactionId,
        receiverCode: payment.receiverCode,
      });

      payment.billId = bill.billId;

      await createNotification(
        student._id,
        "Payment Approved",
        `Your payment for ${payment.month} is approved`,
      );

      await sendEmail({
        to: student.email,
        subject: "Payment Approved",
        html: `<b>Bill ID:</b> ${bill.billId}`,
      });
    }

    /* REJECT */
    if (status === "UNPAID") {
      payment.transactionId = null;
      payment.screenshot = null;
      payment.billId = null;
    }

    await payment.save();

    getIO().emit("paymentVerified");

    res.json({ message: "Payment updated", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const exportMonthlyPayments = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const students = await User.find({
      role: "STUDENT",
      ownerId: req.user._id,
      status: "ACTIVE",
    });

    const payments = await Payment.find({
      month,
      year: Number(year),
    }).populate("studentId");

    const paymentMap = {};
    payments.forEach((p) => {
      if (p.studentId) {
        paymentMap[p.studentId._id.toString()] = p;
      }
    });

    const rows = students.map((student) => {
      const existing = paymentMap[student._id.toString()];

      return {
        Student: student.name,
        Email: student.email,
        Month: month,
        Year: year,
        Amount: existing?.amount || 0,
        Mode: existing?.paymentMode || "—",
        Receiver: existing?.receiverCode || "—",
        Status: existing?.status || "UNPAID",
      };
    });

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment(`${month}-${year}-ledger.csv`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
};
