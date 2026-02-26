import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },

    roomName: {
      type: String,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    occupiedSeats: {
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

/**
 * 🧠 Virtual field (optional but useful)
 * availableSeats = capacity - (occupied + reserved)
 */
roomSchema.virtual("availableSeats").get(function () {
  return this.capacity - (this.occupiedSeats + this.reservedSeats);
});

roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;
