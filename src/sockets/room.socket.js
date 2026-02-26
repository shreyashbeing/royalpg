const roomSocket = (io, socket) => {
  socket.on("room:update", () => {
    io.emit("roomUpdated");
  });
};

export default roomSocket;
