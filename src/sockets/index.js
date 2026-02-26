import roomSocket from "./room.socket.js";
import paymentSocket from "./payment.socket.js";
import pollSocket from "./poll.socket.js";
import profileSocket from "./profile.socket.js";

const registerSockets = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    roomSocket(io, socket);
    paymentSocket(io, socket);
    pollSocket(io, socket);
    profileSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};

export default registerSockets;
