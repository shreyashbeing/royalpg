import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  getAdmissionRequests,
  approveAdmission,
  rejectAdmission,
} from "../controllers/admission.controller.js";

const router = express.Router();

router.get("/requests", auth("OWNER"), getAdmissionRequests);
router.put("/approve/:id", auth("OWNER"), approveAdmission);
router.delete("/reject/:id", auth("OWNER"), rejectAdmission);

export default router;
