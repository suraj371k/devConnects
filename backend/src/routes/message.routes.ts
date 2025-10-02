import { Router } from "express";
import { getChatUsers, getMessages, sendMessage } from "../controllers/message.controller";
import { authenticate } from "../middlewares/authenticate";
const router = Router();

router.post("/:receiverId", authenticate, sendMessage);

router.get("/:receiverId", authenticate, getMessages);

router.get('/users/chats' , getChatUsers)

export default router;