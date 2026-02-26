import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    waterService: {
      type: String,
      default: "",
    },
    cleaningService: {
      type: String,
      default: "",
    },
    electricityService: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);

export default Service;
