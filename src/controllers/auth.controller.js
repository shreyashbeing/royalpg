// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import User from "../models/User.model.js";
// import Room from "../models/Room.model.js";
// import { sendEmail } from "../utils/sendEmail.js";
// import { getIO } from "../config/socket.js";
// import crypto from "crypto";
// import dotenv from "dotenv";
// dotenv.config();

// /* ================= UTILS ================= */
// const generateToken = (id) =>
//   jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// const generateOtp = () =>
//   Math.floor(100000 + Math.random() * 900000).toString();

// /* =================================================
//    SIGNUP → CREATE USER + SEND OTP
// ================================================= */
// export const studentSignup = async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       phone,
//       password,
//       fatherName,
//       fatherPhone,
//       college,
//       aadhaarNumber,
//       buildingId,
//       roomId,
//     } = req.body;

//     if (
//       !name ||
//       !email ||
//       !phone ||
//       !password ||
//       !aadhaarNumber ||
//       !buildingId ||
//       !roomId
//     ) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const otp = generateOtp();

//     const newUser = await User.create({
//       role: "STUDENT",
//       ownerId: "697286e0208d8ce2c758359b",
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       fatherName,
//       fatherPhone,
//       college,
//       aadhaarNumber,
//       aadhaarImage: req.file?.path,
//       buildingId,
//       roomId,
//       emailVerified: false,
//       emailOtp: await bcrypt.hash(otp, 10),
//       emailOtpExpiry: Date.now() + 10 * 60 * 1000,
//       status: "PENDING", // OTP Pending
//     });

//     // Email optional (won't crash)
//     try {
//       await sendEmail({
//         to: email,
//         subject: "Verify your PG Registration",
//         html: `<h2>Your OTP is ${otp}</h2>`,
//       });
//     } catch (err) {
//       console.log("Email failed:", err.message);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Signup successful. Please verify OTP.",
//       otpForTesting: otp, // REMOVE IN PRODUCTION
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       error: err.message,
//     });
//   }
// };

// /* =================================================
//    VERIFY EMAIL OTP → SEAT RESERVE
// ================================================= */
// export const verifyEmailOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     const user = await User.findOne({ email });
//     if (!user || user.emailVerified) {
//       return res.status(400).json({ message: "Invalid request" });
//     }

//     if (!user.emailOtp || user.emailOtpExpiry < Date.now()) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     const validOtp = await bcrypt.compare(otp, user.emailOtp);
//     if (!validOtp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     user.emailVerified = true;
//     user.emailOtp = undefined;
//     user.emailOtpExpiry = undefined;

//     // 🚫 DO NOT reserve seat here
//     user.status = "PENDING_APPROVAL";

//     await user.save();

//     res.json({
//       message: "Email verified. Waiting for owner approval.",
//     });
//   } catch (err) {
//     console.error("VERIFY ERROR:", err);
//     res.status(500).json({ message: "Verification failed" });
//   }
// };

// /* =================================================
//    LOGIN
// ================================================= */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     let user = await User.findOne({ email }).select("+password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.emailVerified) {
//       return res.status(403).json({ message: "Email not verified" });
//     }

//     if (user.status !== "ACTIVE") {
//       return res.status(403).json({
//         message: "Your admission is not approved by owner yet",
//       });
//     }

//     const token = generateToken(user._id);

//     res.json({
//       message: "Login successful",
//       token,
//       user,
//     });
//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ message: "Login failed" });
//   }
// };

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.json({ message: "If email exists, reset link sent" });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // 🔥 HASH TOKEN BEFORE SAVING
//     user.resetPasswordToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 min
//     await user.save();

//     const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

//     await sendEmail({
//       to: user.email,
//       subject: "Reset Password",
//       html: `
//         <p>Click to reset password:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//       `,
//     });

//     res.json({ message: "Reset link sent" });
//   } catch (err) {
//     res.status(500).json({ message: "Forgot password failed" });
//   }
// };

// export const resetPassword = async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;

//     if (!password || password.length < 6) {
//       return res.status(400).json({
//         message: "Password must be at least 6 characters",
//       });
//     }

//     const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

//     const user = await User.findOne({
//       resetPasswordToken: hashedToken,
//       resetPasswordExpiry: { $gt: Date.now() },
//     }).select("+password");

//     if (!user) {
//       return res.status(400).json({
//         message: "Invalid or expired reset link",
//       });
//     }

//     // 🔥🔥🔥 THIS WAS MISSING
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(password, salt);

//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpiry = undefined;

//     await user.save();

//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("RESET ERROR:", err);
//     res.status(500).json({ message: "Reset failed" });
//   }
// };

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import Room from "../models/Room.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

/* ================= UTILS ================= */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =================================================
   SIGNUP → CREATE USER (OTP PENDING)
================================================= */
export const studentSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      fatherName,
      fatherPhone,
      college,
      aadhaarNumber,
      buildingId,
      roomId,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !aadhaarNumber ||
      !buildingId ||
      !roomId
    ) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const newUser = await User.create({
      role: "STUDENT",
      ownerId: "697286e0208d8ce2c758359b",
      name,
      email,
      phone,
      password: hashedPassword,
      fatherName,
      fatherPhone,
      college,
      aadhaarNumber,
      aadhaarImage: req.file?.path,
      buildingId,
      roomId,
      emailVerified: false,
      emailOtp: await bcrypt.hash(otp, 10),
      emailOtpExpiry: Date.now() + 10 * 60 * 1000,
      status: "PENDING", // OTP pending
    });

    const emailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Verify your Email</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:30px 10px;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;
box-shadow:0 6px 18px rgba(0,0,0,0.08);max-width:600px;">

<!-- HEADER -->
<tr>
<td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
padding:30px;text-align:center;color:white;">
<h1 style="margin:0;font-size:24px;">🎉 Welcome to Royal PG</h1>
<p style="margin-top:8px;font-size:14px;opacity:0.9;">
Secure Email Verification
</p>
</td>
</tr>

<!-- BODY -->
<tr>
<td style="padding:35px;text-align:center;color:#333;">

<h2 style="margin-top:0;">Verify Your Email Address</h2>

<p style="font-size:15px;line-height:1.6;color:#555;">
Use the One-Time Password (OTP) below to complete your registration.
This OTP will expire in <b>5 minutes</b>.
</p>

<!-- OTP BOX -->
<div style="
margin:25px auto;
display:inline-block;
padding:18px 30px;
font-size:32px;
letter-spacing:6px;
font-weight:bold;
color:#4f46e5;
background:#f1f5ff;
border-radius:10px;
border:2px dashed #4f46e5;">
${otp}
</div>

<p style="font-size:14px;color:#777;margin-top:20px;">
⚠️ Never share this OTP with anyone.
</p>

<!-- BUTTON -->
<a href="#"
style="
display:inline-block;
margin-top:25px;
padding:14px 28px;
background:#4f46e5;
color:#ffffff;
text-decoration:none;
border-radius:8px;
font-weight:bold;
font-size:15px;">
Verify Now
</a>

</td>
</tr>

<!-- FOOTER -->
<tr>
<td style="background:#fafafa;padding:20px;text-align:center;
font-size:12px;color:#888;">
<p style="margin:0;">
If you didn’t request this email, you can safely ignore it.
</p>
<p style="margin-top:6px;">
© 2026 PG Registration • Secure Authentication System
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;

    // 🔥 Don't block API because of email timeout
    sendEmail({
      to: email,
      subject: "Verify your PG Registration",
      html: emailTemplate(otp),
    }).catch((err) => console.log("Email failed:", err.message));

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please verify OTP.",
      otpForTesting: otp, // REMOVE IN PRODUCTION
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

/* =================================================
   VERIFY EMAIL OTP
================================================= */
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.emailVerified) {
      return res.status(400).json({ message: "Invalid request" });
    }

    if (!user.emailOtp || user.emailOtpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const validOtp = await bcrypt.compare(otp, user.emailOtp);
    if (!validOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    user.status = "PENDING_APPROVAL";

    await user.save();

    res.json({
      message: "Email verified. Waiting for owner approval.",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ message: "Verification failed" });
  }
};

/* =================================================
   OWNER APPROVES STUDENT → RESERVE SEAT
================================================= */
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user || user.role !== "STUDENT") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (user.status !== "PENDING_APPROVAL") {
      return res.status(400).json({ message: "Invalid approval state" });
    }

    // 🔥 Reserve seat NOW
    await Room.findByIdAndUpdate(user.roomId, {
      $inc: { occupiedSeats: 1 },
    });

    user.status = "ACTIVE";
    await user.save();

    res.json({ message: "Student approved & seat reserved" });
  } catch (err) {
    console.error("APPROVAL ERROR:", err);
    res.status(500).json({ message: "Approval failed" });
  }
};

/* =================================================
   LOGIN
================================================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: "Waiting for owner approval",
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =================================================
   FORGOT PASSWORD
================================================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If email exists, reset link sent" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    sendEmail({
      to: user.email,
      subject: "Reset Password",
      html: `<a href="${resetUrl}">Reset Password</a>`,
    }).catch((err) => console.log("Reset email failed:", err.message));

    res.json({ message: "Reset link sent" });
  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ message: "Forgot password failed" });
  }
};

/* =================================================
   RESET PASSWORD
================================================= */
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ message: "Reset failed" });
  }
};
