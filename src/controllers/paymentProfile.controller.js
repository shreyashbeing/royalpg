import PaymentProfile from "../models/PaymentProfile.model.js";
import { getIO } from "../config/socket.js";

/**
 * STUDENT + OWNER → GET LIVE
 */
import Building from "../models/Building.model.js";

export const getLiveProfile = async (req, res) => {
  try {
    let ownerId;

    if (req.user.role === "OWNER") {
      ownerId = req.user._id;
    } else {
      const building = await Building.findById(req.user.buildingId);
      if (!building)
        return res.status(400).json({ message: "Building not found" });

      ownerId = building.ownerId;
    }

    const live = await PaymentProfile.findOne({
      ownerId,
      isLive: true,
    });

    res.json(live);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to load payment profile" });
  }
};

/**
 * OWNER → GET ALL
 */
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await PaymentProfile.find({
      ownerId: req.user._id,
    });
    res.json(profiles);
  } catch {
    res.status(500).json({ message: "Failed to fetch profiles" });
  }
};

/**
 * OWNER → SAVE / UPDATE
 */
export const saveProfile = async (req, res) => {
  try {
    const { label, code, upiId, bankName, accountNumber, ifscCode } = req.body;

    const data = {
      ownerId: req.user._id,
      label,
      code,
      upiId,
      bankName,
      accountNumber,
      ifscCode,
    };

    if (req.file) data.qrImage = req.file.path;

    const profile = await PaymentProfile.findOneAndUpdate(
      { ownerId: req.user._id, label },
      { $set: data },
      { new: true, upsert: true },
    );

    getIO().emit("paymentProfileUpdated");
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to save profile" });
  }
};

/**
 * OWNER → SET LIVE
 */
export const setLiveProfile = async (req, res) => {
  try {
    const { id } = req.params;

    await PaymentProfile.updateMany(
      { ownerId: req.user._id },
      { isLive: false },
    );

    const active = await PaymentProfile.findByIdAndUpdate(
      id,
      { isLive: true },
      { new: true },
    );

    getIO().emit("paymentProfileUpdated");
    res.json(active);
  } catch {
    res.status(500).json({ message: "Failed to set active profile" });
  }
};
