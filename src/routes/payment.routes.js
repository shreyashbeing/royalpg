import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  createPaymentRequest,
  verifyPayment,
  getAllPayments,
  getMyPayments,
} from "../controllers/payment.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { exportMonthlyPayments } from "../controllers/payment.controller.js";

const router = express.Router();

/* =====================================================
   STUDENT ROUTES
===================================================== */

/* create payment request */
router.post(
  "/request",
  auth("STUDENT"),
  upload.single("screenshot"),
  createPaymentRequest,
);

/* my payment history */
router.get("/my", auth("STUDENT"), getMyPayments);

/* =====================================================
   OWNER ROUTES
===================================================== */

/*
GET MONTHLY LEDGER

Query params:
?month=February&year=2026

IMPORTANT:
Month + Year required
*/
router.get("/all", auth("OWNER"), getAllPayments);

/*
VERIFY PAYMENT
PENDING → PAID
PENDING → UNPAID
*/
router.put("/verify/:paymentId", auth("OWNER"), verifyPayment);

router.get("/export", auth("OWNER"), exportMonthlyPayments);

export default router;
