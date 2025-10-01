import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { authenticate } from "../middlewares/authenticate";
const router = Router();

router.post("/:receiverId", authenticate, sendMessage);

router.get("/:receiverId", authenticate, getMessages);

export default router;