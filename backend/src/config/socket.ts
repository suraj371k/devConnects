import { DefaultEventsMap, Server } from "socket.io";
import { Server as HTTPServer } from "http";

export const onlineUsers = new Map<string, string>();

let ioInstance: Server | null = null;
let io: Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
> | null = null;
export const initializeSocket = (httpServer: HTTPServer) => {
  if (ioInstance) {
    console.warn("Socket.IO already initialized. Returning existing instance.");
    return ioInstance;
  }

  io = new Server(httpServer, {
    cors: {
      origin: ["https://dev-connects.vercel.app", "http://localhost:5173"],
      credentials: true,
    },
  });

  //handle socket connection
  io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);

    //join specific room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`${socket.id} joined room ${roomId}`);
    });

    //send message
    socket.on("sendMessage", ({ roomId, message }) => {
      console.log(`message in ${roomId}:`, message);
      socket.to(roomId).emit("receiveMessage", message); // ✅ Fixed event name
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("typing", { socketId: socket.id, isTyping });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
  return io;
};

// Getter for io instance
export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
