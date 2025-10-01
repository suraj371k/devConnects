import mongoose from "mongoose";

export const connectDb = () => {
  mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("MongoDB error:", err));
};
