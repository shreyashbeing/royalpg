import Notice from "../models/Notice.model.js";
import { getIO } from "../config/socket.js";

/**
 * CREATE NOTICE (Owner)
 */
export const createNotice = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Notice text is required" });
    }

    const notice = await Notice.create({
      text: text.trim(),
      createdBy: req.user?._id || null,
      isActive: true,
    });

    // 🔔 Real-time emit
    const io = getIO();
    io.emit("noticeCreated", notice);

    res.status(201).json(notice);
  } catch (err) {
    console.error("CREATE NOTICE ERROR:", err);
    res.status(500).json({ message: "Failed to create notice" });
  }
};

/**
 * GET ACTIVE NOTICES (Students Dashboard)
 */
export const getActiveNotices = async (req, res) => {
  try {
    const notices = await Notice.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(notices);
  } catch (err) {
    console.error("GET NOTICE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch notices" });
  }
};

/**
 * DELETE NOTICE (Soft Delete)
 */
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    const io = getIO();
    io.emit("noticeDeleted", id);

    res.json({ message: "Notice deleted successfully" });
  } catch (err) {
    console.error("DELETE NOTICE ERROR:", err);
    res.status(500).json({ message: "Failed to delete notice" });
  }
};
