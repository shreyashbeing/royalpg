import MonthlyPayment from "../models/MonthlyPayment.model.js";
import User from "../models/User.model.js";

/**
 * OWNER → GET MONTHLY PAYMENT REGISTER
 * Auto-creates UNPAID entries for missing students
 */
export const getMonthlyPayments = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { month, year, status } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    // 1️⃣ get all active students of this owner
    const students = await User.find({
      ownerId,
      role: "STUDENT",
      status: "ACTIVE",
    }).select("_id name roomId");

    // 2️⃣ ensure MonthlyPayment exists for each student
    const bulkOps = students.map((s) => ({
      updateOne: {
        filter: {
          studentId: s._id,
          month,
          year,
        },
        update: {
          $setOnInsert: {
            studentId: s._id,
            ownerId,
            month,
            year,
            status: "UNPAID",
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await MonthlyPayment.bulkWrite(bulkOps);
    }

    // 3️⃣ build filter
    const filter = { ownerId, month, year };
    if (status && status !== "ALL") {
      filter.status = status;
    }

    // 4️⃣ fetch register
    const payments = await MonthlyPayment.find(filter)
      .populate({
        path: "studentId",
        select: "name roomId",
        populate: {
          path: "roomId",
          select: "roomName",
        },
      })
      .populate("paymentId")
      .sort({ status: 1, createdAt: 1 }); // UNPAID → PENDING → PAID

    res.json(payments);
  } catch (err) {
    console.error("MONTHLY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Failed to load monthly payments" });
  }
};

/**
 * OWNER → EXPORT CSV (month-end)
 */
export const exportMonthlyPaymentsCSV = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const payments = await MonthlyPayment.find({
      ownerId,
      month,
      year,
    })
      .populate({
        path: "studentId",
        select: "name roomId",
        populate: {
          path: "roomId",
          select: "roomName",
        },
      })
      .populate("paymentId");

    // CSV header
    let csv =
      "Student Name,Room,Month,Year,Status,Amount,Receiver,Transaction ID\n";

    payments.forEach((p) => {
      csv +=
        [
          p.studentId?.name || "",
          p.studentId?.roomId?.roomName || "",
          month,
          year,
          p.status,
          p.paymentId?.amount || "",
          p.paymentId?.receiverCode || "",
          p.paymentId?.transactionId || "",
        ].join(",") + "\n";
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payments_${month}_${year}.csv`,
    );

    res.send(csv);
  } catch (err) {
    console.error("CSV EXPORT ERROR:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};
