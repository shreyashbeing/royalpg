import Service from "../models/Service.model.js";
import { getIO } from "../config/socket.js";

/**
 * GET SERVICES (Owner + Student)
 */
export const getServices = async (req, res) => {
  try {
    let services = await Service.findOne();

    // create default if not exists
    if (!services) {
      services = await Service.create({});
    }

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch services" });
  }
};

/**
 * UPDATE SERVICES (Owner only)
 */
export const updateServices = async (req, res) => {
  try {
    const updated = await Service.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
    });

    // realtime update to students
    getIO().emit("servicesUpdated", updated);

    res.json({
      message: "Services updated",
      services: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update services" });
  }
};
