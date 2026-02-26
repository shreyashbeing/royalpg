import express from "express";
import auth from "../middlewares/auth.middleware.js";

import {
  createPoll,
  getActivePoll,
  votePoll,
  endPoll,
  getPollResult,
} from "../controllers/poll.controller.js";

const router = express.Router();

// Anyone logged in (Owner + Student)
router.get("/active", auth(), getActivePoll);

// Student only
router.post("/vote/:pollId", auth("STUDENT"), votePoll);

// Owner only
router.post("/create", auth("OWNER"), createPoll);
router.put("/end/:pollId", auth("OWNER"), endPoll);
router.get("/result/:pollId", auth("OWNER"), getPollResult);

export default router;
