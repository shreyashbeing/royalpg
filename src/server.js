import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import initSocket from "./config/socket.js";

const server = http.createServer(app);

// 🔥 YAHI SE SOCKET INIT
initSocket(server);

connectDB();

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
