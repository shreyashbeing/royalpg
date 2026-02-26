import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  getMonthlyPayments,
  exportMonthlyPaymentsCSV,
} from "../controllers/monthlyPayment.controller.js";

const router = express.Router();

// 🔐 OWNER → get monthly register (auto UNPAID generation)
router.get("/", auth("OWNER"), getMonthlyPayments);

// 🔐 OWNER → export CSV for selected month/year
router.get("/export", auth("OWNER"), exportMonthlyPaymentsCSV);

export default router;
