import express from "express";
import auth from "../middlewares/auth.middleware.js";
import { getAllStudents } from "../controllers/student.controller.js";
import { deleteStudent } from "../controllers/ownerStudent.controller.js";

const router = express.Router();

// OWNER ONLY
router.get("/", auth("OWNER"), getAllStudents);
router.delete("/:id", auth("OWNER"), deleteStudent);

export default router;
