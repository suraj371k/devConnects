import { Request, Response } from "express";
import Notification from "../models/notification.model";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const notifications = await Notification.find({ to: userId })
      .sort({
        createdAt: -1,
      })
      .populate("from", "name email")
      .populate("to", "name email");

    let count = notifications.length;
    return res.status(200).json({ success: true, count, notifications });
  } catch (error) {
    console.log("Error in get notifications controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { notificationId } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.log("Error in mark notification as read controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { notificationId } = req.params;
    await Notification.findByIdAndDelete(notificationId);
    return res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in delete notification controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
