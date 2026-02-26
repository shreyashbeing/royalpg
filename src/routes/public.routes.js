import express from "express";
import Building from "../models/Building.model.js";
import Room from "../models/Room.model.js";

const router = express.Router();

/**
 * =====================================
 * GET ACTIVE BUILDINGS (PUBLIC)
 * =====================================
 * Used on Signup page
 */
router.get("/buildings", async (req, res) => {
  try {
    const buildings = await Building.find({ isActive: true })
      .select("_id name")
      .sort({ name: 1 });

    res.json(buildings);
  } catch (error) {
    console.error("PUBLIC BUILDINGS ERROR:", error);
    res.status(500).json({ message: "Failed to load buildings" });
  }
});

/**
 * =====================================
 * GET AVAILABLE ROOMS BY BUILDING (PUBLIC)
 * =====================================
 * ✔ filters FULL rooms
 * ✔ respects reserved + occupied seats
 */
router.get("/rooms", async (req, res) => {
  try {
    const { buildingId } = req.query;

    if (!buildingId) {
      return res.status(400).json({ message: "buildingId required" });
    }

    const rooms = await Room.find({
      buildingId,
      isActive: true,
      $expr: {
        $lt: [{ $add: ["$occupiedSeats", "$reservedSeats"] }, "$capacity"],
      },
    })
      .select("_id roomName capacity occupiedSeats reservedSeats")
      .sort({ roomName: 1 });

    res.json(rooms);
  } catch (error) {
    console.error("PUBLIC ROOMS ERROR:", error);
    res.status(500).json({ message: "Failed to load rooms" });
  }
});

export default router;
