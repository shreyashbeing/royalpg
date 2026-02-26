import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  updateEmail,
  updatePassword,
} from "../controllers/ownerAccount.controller.js";

const router = express.Router();

router.use(auth("OWNER"));

router.put("/email", updateEmail);
router.put("/password", updatePassword);

export default router;
