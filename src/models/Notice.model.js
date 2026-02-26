import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true, // 👈 Important
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notice", noticeSchema);
