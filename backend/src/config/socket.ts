import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import cookie from "cookie";

interface DecodedToken {
  id: string;
}

export const onlineUsers = new Map<string, string>();
let ioInstance: Server | null = null;

export const initializeSocket = (httpServer: HTTPServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "https://dev-connects.vercel.app",
      credentials: true,
    },
  });

  // Set instance immediately
  setIOInstance(io);

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  io.use((socket, next) => {
    try {
      // Parse cookies from handshake headers
      const cookies = cookie.parse(socket.handshake.headers.cookie || '');
      
      // Get token from cookies (adjust the name based on your cookie name)
      const token = cookies.token || cookies.accessToken || cookies.jwt;
      
      if (!token) {
        console.log("❌ No token found in cookies");
        return next(new Error("No token provided"));
      }

      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      socket.data.userId = decoded.id;
      next();
    } catch (error) {
      console.log("❌ JWT verification failed:", error);
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

    onlineUsers.set(userId, socket.id);
    io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      onlineUsers.delete(userId);
      io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const setIOInstance = (io: Server) => {
  ioInstance = io;
};

export const getIOInstance = (): Server => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized. Call initializeSocket first.");
  }
  return ioInstance;
};