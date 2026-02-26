import bcrypt from "bcryptjs";
import User from "../models/User.model.js";

/**
 * OWNER → UPDATE EMAIL
 */
export const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const owner = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    owner.email = newEmail.toLowerCase();
    await owner.save();

    res.json({ message: "Email updated successfully" });
  } catch (err) {
    console.error("UPDATE EMAIL ERROR:", err);
    res.status(500).json({ message: "Failed to update email" });
  }
};

/**
 * OWNER → UPDATE PASSWORD
 */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const owner = await User.findById(req.user._id).select("+password");

    const isMatch = await bcrypt.compare(oldPassword, owner.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password incorrect" });
    }

    owner.password = await bcrypt.hash(newPassword, 10);
    await owner.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("UPDATE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
};
