import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDb } from "./config/db";
import passport from "passport";
import "./config/passport";

//routes imports
import authRoutes from "./routes/auth.routes";
import postRoutes from "./routes/post.routes";
import userRoutes from "./routes/user.routes";
import commentRoutes from './routes/comment.routes'

dotenv.config({ path: ".env" });

const app = express();
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
app.use('/api/comment' , commentRoutes)

// Sample route
app.get("/api/hello", (_req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express backend!" });
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
