import express from "express";
import auth from "../middlewares/auth.middleware.js";

import {
  addBuilding,
  getBuildings,
  removeBuilding,
  getOwnerStudents,
} from "../controllers/owner.controller.js";

import { addRoom, deleteRoom } from "../controllers/ownerRoom.controller.js";

import {
  getServices,
  updateServices,
} from "../controllers/owner.service.controller.js";

import Room from "../models/Room.model.js";

const router = express.Router();
router.use(auth("OWNER"));

// Buildings
router.post("/building", addBuilding);
router.get("/building", getBuildings);
router.delete("/building/:buildingId", removeBuilding);

router.get("/students", getOwnerStudents);

// Rooms (🔥 REAL CONTROLLER)
router.get("/rooms", async (req, res) => {
  const { buildingId } = req.query;
  const rooms = await Room.find({ buildingId }).sort({ roomName: 1 });
  res.json(rooms);
});

router.post("/rooms", addRoom);
router.delete("/rooms/:roomId", deleteRoom);

// Services
router.get("/services", getServices);
router.put("/services", updateServices);

export default router;
