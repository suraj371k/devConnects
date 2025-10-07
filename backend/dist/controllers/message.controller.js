"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatUsers = exports.getMessages = exports.sendMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const message_model_1 = __importDefault(require("../models/message.model"));
const socket_1 = require("../config/socket");
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.params;
        const { text } = req.body;
        if (!mongoose_1.default.isValidObjectId(userId) ||
            !mongoose_1.default.isValidObjectId(receiverId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user id" });
        }
        const message = await message_model_1.default.create({
            sender: userId,
            receiver: receiverId,
            text,
        });
        // Populate the sender and receiver details
        const populatedMessage = await message_model_1.default.findById(message._id)
            .populate("sender", "name email")
            .populate("receiver", "name email");
        //send message via socket.io to receiver if they online
        const io = (0, socket_1.getIOInstance)();
        const receiverSocketId = socket_1.onlineUsers.get(receiverId);
        if (receiverSocketId) {
            // Send to specific user only
            io.to(receiverSocketId).emit("newMessage", populatedMessage);
        }
        res.status(201).json({ success: true, message: populatedMessage });
    }
    catch (error) {
        console.log("Error in send message controller", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.sendMessage = sendMessage;
const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { receiverId } = req.params;
        if (!mongoose_1.default.isValidObjectId(userId) ||
            !mongoose_1.default.isValidObjectId(receiverId)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid user id" });
        }
        // Get messages between current user and the receiver
        const messages = await message_model_1.default.find({
            $or: [
                { sender: userId, receiver: receiverId },
                { sender: receiverId, receiver: userId },
            ],
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: 1 }); // Sort by creation time
        res.status(200).json({ success: true, messages });
    }
    catch (error) {
        console.log("Error in get messages controller", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getMessages = getMessages;
// Optional: Get all users the current user has chatted with
const getChatUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find all unique users who have exchanged messages with current user
        const messages = await message_model_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose_1.default.Types.ObjectId(userId) },
                        { receiver: new mongoose_1.default.Types.ObjectId(userId) },
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
                            { $eq: ["$sender", new mongoose_1.default.Types.ObjectId(userId)] },
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
    }
    catch (error) {
        console.log("Error in get chat users controller", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getChatUsers = getChatUsers;
