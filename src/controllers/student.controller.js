import User from "../models/User.model.js";
import { getIO } from "../config/socket.js";

/**
 * STUDENT → GET OWN PROFILE
 */
export const getMyProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate("buildingId", "name")
      .populate("roomId", "roomName");

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * STUDENT → UPDATE PROFILE
 */
export const updateMyProfile = async (req, res) => {
  try {
    const updates = {
      name: req.body.name,
      phone: req.body.phone,
      fatherName: req.body.fatherName,
      fatherPhone: req.body.fatherPhone,
      college: req.body.college,
    };

    // optional aadhaar image update
    if (req.file) {
      updates.aadhaarImage = req.file.path;
    }

    const updatedStudent = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    // realtime update to owner dashboard
    getIO().emit("profileUpdated", {
      studentId: updatedStudent._id,
      data: updates,
    });

    res.json({
      message: "Profile updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

/**
 * OWNER → GET ALL STUDENTS
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "STUDENT" })
      .populate("buildingId", "name")
      .populate("roomId", "roomName")
      .sort({ createdAt: -1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

export const getTotalStudents = async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: "STUDENT",
      ownerId: req.user._id,
      status: "ACTIVE",
    });

    res.json({ total: count });
  } catch (err) {
    res.status(500).json({ message: "Failed to count students" });
  }
};
