import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    totalRooms: {
      type: Number,
      default: 0,
    },

    totalCapacity: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Building = mongoose.model("Building", buildingSchema);
export default Building;
