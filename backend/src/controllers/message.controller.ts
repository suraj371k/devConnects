import { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/message.model";
import { getIo } from "../config/socket";

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

    try {
      const io = getIo();
      io.to(receiverId).emit("receiverMessage", {
        _id: message._id,
        text: message.text,
        sender: userId,
        receiver: receiverId,
        createdAt: message.createdAt,
      });
    } catch (error: any) {
      console.log("socket.io not initialized", error.message);
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
      .sort({ createdAt: 1 });

    try {
      const io = getIo();
      io.to(receiverId);
    } catch (err: any) {
      console.log("Socket.IO not initialized:", err.message);
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.log("Error in get messages controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getChatUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Find all unique users who have exchanged messages with current user
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", new mongoose.Types.ObjectId(userId)] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          avatar: "$user.avatar",
          lastMessage: "$lastMessage.text",
          lastMessageTime: "$lastMessage.createdAt",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    res.status(200).json({ success: true, users: messages });
  } catch (error) {
    console.log("Error in get chat users controller", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
