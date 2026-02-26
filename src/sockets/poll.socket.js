const pollSocket = (io, socket) => {
  socket.on("poll:start", (poll) => {
    io.emit("pollStarted", poll);
  });

  socket.on("poll:update", (poll) => {
    io.emit("pollUpdated", poll);
  });

  socket.on("poll:end", (poll) => {
    io.emit("pollEnded", poll);
  });
};

export default pollSocket;
