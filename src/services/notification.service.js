import Notification from "../models/Notification.model.js";
import { getIO } from "../config/socket.js";

export const createNotification = async (userId, title, message) => {
  const notification = await Notification.create({
    userId,
    title,
    message,
  });

  // realtime push
  getIO().emit("notification", {
    userId,
    title,
    message,
  });

  return notification;
};
