import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getPaymentProfile,
  updatePaymentProfile,
} from "../controllers/paymentProfile.controller.js";

const router = express.Router();

router.get("/", auth, getPaymentProfile); // student + owner
router.put("/", auth("OWNER"), upload.single("qr"), updatePaymentProfile);

export default router;
