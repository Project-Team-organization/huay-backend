const { Server } = require("socket.io");

let io = null;

const allowedOrigins = [
  "https://admin.kaojing.online",
  "https://xian.kaojing.online",
  "https://asia.kaojing.online",
  "https://kaojing.online",
  "https://admin.luckyk168.com",
  "https://sain.luckyk168.com",
  "https://www.luckyk168.com",
  "https://luckyk168.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://asian.luckyk168.com",
];

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed list
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith("http://localhost")) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive for local/dev
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

    // Join admin room
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      // console.log(`🛡️ Socket ${socket.id} joined admin_room`);
      socket.emit("joined_admin_room_success", { status: true, time: new Date() });
    });

    socket.on("leave_admin_room", () => {
      socket.leave("admin_room");
    });

    socket.on("disconnect", () => {
      // console.log(`🔌 Client disconnected from Socket.io: ${socket.id}`);
    });
  });

  console.log("⚡ Socket.io initialized successfully");
  return io;
}

function getIO() {
  return io;
}

/**
 * Emit an event to all admin clients
 * @param {string} event - Event name (e.g. 'new_deposit', 'new_withdrawal')
 * @param {object} data - Payload
 */
function emitToAdmin(event, data) {
  if (!io) {
    console.warn("⚠️ Socket.io not initialized yet. Skipping emit:", event);
    return;
  }
  // Emit to admin_room and broadcast
  io.to("admin_room").emit(event, data);
  io.emit(event, data);
}

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
};
