import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  getMyProfile,
  updateMyProfile,
  getAllStudents,
  getTotalStudents,
} from "../controllers/student.controller.js";

import { getServices } from "../controllers/owner.service.controller.js";

const router = express.Router();

// Student routes
router.get("/me", auth("STUDENT"), getMyProfile);

router.put(
  "/me",
  auth("STUDENT"),
  upload.single("aadhaarImage"),
  updateMyProfile,
);

// Owner route
router.get("/all", auth("OWNER"), getAllStudents);

// 🔥 FIXED SERVICES ROUTE
router.get("/services", auth("STUDENT"), getServices);

router.get("/count", auth("OWNER"), getTotalStudents);

export default router;
