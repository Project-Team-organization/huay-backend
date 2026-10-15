const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all origins (reflection) for development & production
        // This prevents any CORS mismatch between localhost, 127.0.0.1, and domain names
        return callback(null, true);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      credentials: true,
    },
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    const origin = socket.handshake.headers.origin || socket.handshake.address;
    console.log(`🔌 [Socket.io] Client connected: ${socket.id} from ${origin}`);

    // Join admin room
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      console.log(`🛡️ [Socket.io] Socket ${socket.id} joined admin_room`);
      socket.emit("joined_admin_room_success", { status: true, time: new Date() });
    });

    socket.on("leave_admin_room", () => {
      socket.leave("admin_room");
      console.log(`🚪 [Socket.io] Socket ${socket.id} left admin_room`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`❌ [Socket.io] Client disconnected: ${socket.id} (${reason})`);
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
 * @param {string} event - Event name (e.g. 'new_deposit', 'new_withdrawal', 'new_transaction')
 * @param {object} data - Payload
 */
function emitToAdmin(event, data) {
  if (!io) {
    console.warn("⚠️ [Socket.io] Not initialized yet. Skipping emit:", event);
    return;
  }
  const connectedCount = io.engine?.clientsCount || 0;
  console.log(`📡 [Socket.io] Emitting '${event}' to ${connectedCount} connected client(s):`, {
    type: data.type,
    amount: data.amount,
    user: data.username,
  });

  // Emit to admin_room AND broadcast to root so any connected admin receives it
  io.to("admin_room").emit(event, data);
  io.emit(event, data);
}

module.exports = {
  initSocket,
  getIO,
  emitToAdmin,
};
