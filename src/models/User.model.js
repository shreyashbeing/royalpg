import mongoose from "mongoose";
import Room from "./Room.model.js"; // 🔥 IMPORTANT

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["OWNER", "STUDENT"],
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // OWNER
    },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },

    password: {
      type: String,
      required: true,
      select: false,
    },

    fatherName: String,
    fatherPhone: String,
    college: String,

    aadhaarNumber: String,
    aadhaarImage: String,

    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: String,
    emailOtpExpiry: Date,

    status: {
      type: String,
      enum: ["PENDING", "PENDING_APPROVAL", "ACTIVE"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

/* =========================================
   🔥 AUTO SEAT RELEASE ON STUDENT DELETE
========================================= */
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;

  if (doc.role === "STUDENT" && doc.roomId) {
    await Room.findByIdAndUpdate(doc.roomId, {
      $inc: { occupiedSeats: -1 },
    });
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
