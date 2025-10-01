import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db";
import passport from "passport";
import "./config/passport";
import { createServer } from "http";
import { Server } from "socket.io";

//routes imports
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import messageRoutes from "./routes/message.routes";
import Message from "./models/message.model";
import { setSocketIO } from "./controllers/message.controller"; // Import the setter

dotenv.config({ path: ".env" });

const app = express();
const server = createServer(app);

//socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Set the io instance in the message controller
setSocketIO(io);

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(passport.initialize());

// MongoDB connection
connectDb();

//routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/message", messageRoutes);

// Sample route
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

//socket.io events
interface SocketData {
  userId: string;
}

// Store user socket connections
const userSockets = new Map();

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  // Join room based on user ID for private messaging
  socket.on("joinUser", (userId: string) => {
    userSockets.set(userId, socket.id);
    socket.join(`user_${userId}`);
    console.log(`user ${userId} joined their room with socket ${socket.id}`);
  });

  // Join room for specific conversation
  socket.on("joinConversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`user ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle real-time message sending
  socket.on("sendMessage", async ({ senderId, receiverId, text }) => {
    try {
      // Save message to DB
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        text,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");

      // Emit the message to both users' rooms
      const senderRoom = `user_${senderId}`;
      const receiverRoom = `user_${receiverId}`;

      // Also emit to the conversation room
      const conversationRoom = [senderId, receiverId].sort().join("_");

      io.to(senderRoom).emit("receiveMessage", populatedMessage);
      io.to(receiverRoom).emit("receiveMessage", populatedMessage);
      io.to(conversationRoom).emit("receiveMessage", populatedMessage);

      console.log(`Message sent from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error("Error sending message via socket:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typingStart", ({ senderId, receiverId }) => {
    const receiverRoom = `user_${receiverId}`;
    io.to(receiverRoom).emit("userTyping", { senderId, isTyping: true });
  });

  socket.on("typingStop", ({ senderId, receiverId }) => {
    const receiverRoom = `user_${receiverId}`;
    io.to(receiverRoom).emit("userTyping", { senderId, isTyping: false });
  });

  // Handle message read receipts
  socket.on("markMessagesAsRead", async ({ userId, senderId }) => {
    try {
      await Message.updateMany(
        {
          sender: senderId,
          receiver: userId,
          read: false,
        },
        {
          $set: { read: true, readAt: new Date() },
        }
      );

      // Notify the sender that their messages were read
      const senderRoom = `user_${senderId}`;
      io.to(senderRoom).emit("messagesRead", { readerId: userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from userSockets map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
