import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { downloadBill } from "../controllers/bill.controller.js";

const router = express.Router();

router.get("/:billId", auth(), downloadBill);

export default router;
