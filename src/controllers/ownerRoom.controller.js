import Room from "../models/Room.model.js";
import Building from "../models/Building.model.js";
import { getIO } from "../config/socket.js";

/**
 * ADD room
 */
export const addRoom = async (req, res) => {
  try {
    const { name, capacity, buildingId } = req.body;

    const room = await Room.create({
      roomName: name.trim(),
      capacity: Number(capacity),
      buildingId,
    });

    await Building.findByIdAndUpdate(buildingId, {
      $inc: {
        totalRooms: 1,
        totalCapacity: Number(capacity),
      },
    });

    const io = getIO();
    io.emit("roomUpdated");
    io.emit("buildingUpdated");

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to add room" });
  }
};

/**
 * DELETE room
 */
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params; // 🔥 FIXED

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    await Room.findByIdAndDelete(roomId);

    await Building.findByIdAndUpdate(room.buildingId, {
      $inc: {
        totalRooms: -1,
        totalCapacity: -room.capacity,
      },
    });

    const io = getIO();
    io.emit("roomUpdated");
    io.emit("buildingUpdated");

    res.json({ message: "Room deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete room" });
  }
};
