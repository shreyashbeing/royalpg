import User from "../models/User.model.js";
import Room from "../models/Room.model.js";
import { getIO } from "../config/socket.js";

/* GET ALL PENDING ADMISSIONS */
export const getAdmissionRequests = async (req, res) => {
  try {
    const students = await User.find({
      role: "STUDENT",
      ownerId: req.user._id,
      status: "PENDING_APPROVAL",
    }).select("-password");

    res.json(students);
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

/* APPROVE STUDENT */
export const approveAdmission = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findById(student.roomId);

    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }

    if (room.occupiedSeats >= room.capacity) {
      return res.status(400).json({ message: "Room is full" });
    }

    // 🔥 Increase occupied seat
    room.occupiedSeats += 1;
    await room.save();

    student.status = "ACTIVE";
    await student.save();

    res.json({ message: "Student approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};

/* REJECT */
export const rejectAdmission = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    getIO().emit("admissionUpdated");

    res.json({ message: "Student rejected" });
  } catch {
    res.status(500).json({ message: "Rejection failed" });
  }
};
