"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markNotificationAsRead = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await notification_model_1.default.find({ to: userId })
            .sort({
            createdAt: -1,
        })
            .populate("from", "name email")
            .populate("to", "name email");
        let count = notifications.length;
        return res.status(200).json({ success: true, count, notifications });
    }
    catch (error) {
        console.log("Error in get notifications controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.getNotifications = getNotifications;
const markNotificationAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { notificationId } = req.params;
        const notification = await notification_model_1.default.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        return res.status(200).json({ success: true, notification });
    }
    catch (error) {
        console.log("Error in mark notification as read controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const { notificationId } = req.params;
        await notification_model_1.default.findByIdAndDelete(notificationId);
        return res
            .status(200)
            .json({ success: true, message: "Notification deleted successfully" });
    }
    catch (error) {
        console.log("Error in delete notification controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.deleteNotification = deleteNotification;
