import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/message.model";

// Import or get the io instance
let io: any;

export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { receiverId } = req.params;
    const { text } = req.body;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    const message = await Message.create({
      sender: userId,
      receiver: receiverId,
      text,
    });

    // Populate the sender and receiver details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    // Emit the message via Socket.io if available
    if (io) {
      const roomId = [userId, receiverId].sort().join("_");
      io.to(roomId).emit("receiveMessage", populatedMessage);
    }

    res.status(201).json({ success: true, message: populatedMessage });
  } catch (error) {
    console.log("Error in send message controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { receiverId } = req.params;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(receiverId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }

    // Get messages between current user and the receiver
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 }); // Sort by creation time

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log("Error in get messages controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
