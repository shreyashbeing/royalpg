import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import ownerRoutes from "./routes/owner.routes.js";
import studentRoutes from "./routes/student.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import pollRoutes from "./routes/poll.routes.js";

import ownerStudentRoutes from "./routes/ownerStudent.routes.js";
import publicRoutes from "./routes/public.routes.js";
import paymentProfileRoutes from "./routes/paymentProfile.routes.js";
import ownerAccountRoutes from "./routes/owner.account.routes.js";
import billRoutes from "./routes/bill.routes.js";
import AdmissionRoutes from "./routes/admission.routes.js";
import noticeRoutes from "./routes/notice.routes.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // ya tumhara frontend port
    credentials: false,
  }),
);

app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/poll", pollRoutes);
app.use("/api/owner/students", ownerStudentRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payment-profile", paymentProfileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/owner/account", ownerAccountRoutes);
app.use("/api/bill", billRoutes);
app.use("/api/admission", AdmissionRoutes);
app.use("/api/notice", noticeRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ success: true, message: "PG Management API running 🚀" });
});

export default app;
