import express from "express";
import {
  createNotice,
  getActiveNotices,
  deleteNotice,
} from "../controllers/notice.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create Notice
router.post("/create", auth(), createNotice);

// Get Active Notices
router.get("/active", auth(), getActiveNotices);

// Delete Notice
router.delete("/:id", auth(), deleteNotice);

export default router;
