import express from "express";
import auth from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  getLiveProfile,
  getAllProfiles,
  saveProfile,
  setLiveProfile,
} from "../controllers/paymentProfile.controller.js";

const router = express.Router();

// STUDENT + OWNER → LIVE
router.get("/", auth(), getLiveProfile);

// OWNER → ALL
router.get("/all", auth("OWNER"), getAllProfiles);

// OWNER → SAVE
router.post("/", auth("OWNER"), upload.single("qrImage"), saveProfile);

// OWNER → SET LIVE
router.put("/active/:id", auth("OWNER"), setLiveProfile);

export default router;
