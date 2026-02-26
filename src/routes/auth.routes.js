import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  studentSignup,
  login,
  verifyEmailOtp,
} from "../controllers/auth.controller.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/signup",
  (req, res, next) => {
    console.log("🔥 Signup Route Hit 🔥");
    next();
  },
  upload.single("aadhaarImage"),
  (err, req, res, next) => {
    if (err) {
      console.log("🔥 MULTER ERROR 🔥");
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
    next();
  },
  studentSignup,
);

router.post("/verify-email-otp", verifyEmailOtp);
router.post("/login", login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
