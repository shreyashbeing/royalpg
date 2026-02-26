export const paymentProfileSocket = (socket, handlers) => {
  if (!socket) return;

  if (handlers.onUpdated) {
    socket.on("paymentProfileUpdated", handlers.onUpdated);
  }
};
