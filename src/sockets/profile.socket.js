const profileSocket = (io, socket) => {
  socket.on("profile:update", (data) => {
    io.emit("profileUpdated", data);
  });
};

export default profileSocket;
