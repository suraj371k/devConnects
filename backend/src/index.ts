import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db";
import passport from "passport";
import "./config/passport";
import { createServer } from "http";
import { initializeSocket } from "./config/socket";

//routes imports
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from "./routes/comment.routes";
import messageRoutes from "./routes/message.routes";
import notificationRoutes from "./routes/notification.routes";

dotenv.config({ path: ".env" });

const app = express();
const httpServer = createServer(app);

// Middleware should come BEFORE Socket.IO initialization
app.use(cookieParser());
app.use(express.json());
app.use(
  // TEMPORARY: reflect the incoming origin to allow testing from localhost/frontends.
  // WARNING: This is permissive and should be reverted or replaced with a strict
  // allowlist (using FRONTEND_URL) in production.
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl/postman)
      if (!origin) return callback(null, true);
      // Reflect origin back to the response so browser receives ACAO: <origin>
      callback(null, true);
    },
    credentials: true,
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(passport.initialize());

// MongoDB connection
connectDb();

// Initialize Socket.IO AFTER middleware but BEFORE routes
const io = initializeSocket(httpServer);
// Remove setIOInstance(io) - it should be handled inside initializeSocket

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

// Sample route
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

const PORT = process.env.PORT || 6000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
