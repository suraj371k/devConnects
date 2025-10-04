import { Router } from "express";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/notification.controller";
import { authenticate } from "../middlewares/authenticate";
const router = Router();

router.get("/get", authenticate, getNotifications);
router.put("/:notificationId/read", authenticate, markNotificationAsRead);
router.delete("/:notificationId", authenticate, deleteNotification);

export default router;
