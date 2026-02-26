import Building from "../models/Building.model.js";
import Room from "../models/Room.model.js";
import { getIO } from "../config/socket.js";
import Student from "../models/User.model.js";

/**
 * ADD BUILDING
 */
export const addBuilding = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Building name required" });
    }

    const exists = await Building.findOne({
      name,
      ownerId: req.user._id,
    });

    if (exists) {
      return res.status(400).json({ message: "Building already exists" });
    }

    const FIXED_OWNER_ID = "697286e0208d8ce2c758359b";

    const building = await Building.create({
      name,
      ownerId: FIXED_OWNER_ID, // 🔥 FIX
    });

    getIO().emit("roomUpdated");

    res.status(201).json({
      message: "Building added",
      building,
    });
  } catch (error) {
    console.error("ADD BUILDING ERROR:", error);
    res.status(500).json({ message: "Failed to add building" });
  }
};

/**
 * GET ALL BUILDINGS
 */
export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({ isActive: true });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch buildings" });
  }
};

/**
 * REMOVE BUILDING (SOFT DELETE)
 */
export const removeBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;

    // 🔒 owner safety check
    const building = await Building.findOne({
      _id: buildingId,
      ownerId: req.user._id,
    });

    if (!building) {
      return res.status(404).json({ message: "Building not found" });
    }

    // 🧹 delete all rooms of this building
    await Room.deleteMany({ buildingId });

    // 🗑️ delete building itself
    await Building.findByIdAndDelete(buildingId);

    // 🔌 realtime update
    getIO().emit("roomUpdated");

    res.json({ message: "Building deleted permanently" });
  } catch (error) {
    console.error("DELETE BUILDING ERROR:", error);
    res.status(500).json({ message: "Failed to delete building" });
  }
};

/**
 * ADD ROOM
 */
export const addRoom = async (req, res) => {
  try {
    const { buildingId, roomName, capacity } = req.body;

    const room = await Room.create({
      buildingId,
      roomName,
      capacity,
    });

    getIO().emit("roomUpdated");

    res.status(201).json({
      message: "Room added",
      room,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add room" });
  }
};

/**
 * GET ROOMS BY BUILDING
 */
export const getRoomsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.query;

    if (!buildingId) {
      return res.status(400).json({ message: "buildingId required" });
    }

    const rooms = await Room.find({
      buildingId,
      isActive: true,
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

/**
 * REMOVE ROOM
 */
export const removeRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    await Room.findByIdAndUpdate(roomId, {
      isActive: false,
    });

    getIO().emit("roomUpdated");

    res.json({ message: "Room removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove room" });
  }
};

export const getOwnerStudents = async (req, res) => {
  try {
    const { buildingId } = req.query;

    let filter = {
      role: "STUDENT",
      status: "ACTIVE",
      // 🔥 ONLY STUDENTS
    };

    if (buildingId) {
      filter.buildingId = buildingId;
    }

    const students = await Student.find(filter)
      .populate("buildingId")
      .populate("roomId");

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
