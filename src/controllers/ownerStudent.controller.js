import User from "../models/User.model.js";
import Room from "../models/Room.model.js";
import { getIO } from "../config/socket.js";

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔥 FREE SEAT
    if (student.roomId) {
      await Room.findByIdAndUpdate(student.roomId, {
        $inc: { occupiedSeats: -1 },
      });
    }

    await User.findByIdAndDelete(id);

    const io = getIO();
    io.emit("studentUpdated");
    io.emit("roomUpdated");

    res.json({ message: "Student deleted & seat freed" });
  } catch (err) {
    console.error("DELETE STUDENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete student" });
  }
};
