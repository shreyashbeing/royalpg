const paymentSocket = (io, socket) => {
  socket.on("payment:requested", () => {
    io.emit("paymentRequested");
  });

  socket.on("payment:verified", () => {
    io.emit("paymentVerified");
  });
};

export default paymentSocket;
