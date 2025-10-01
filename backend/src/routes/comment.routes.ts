import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { createComment, deleteComment, getComments, updateComment } from "../controllers/comment.controller";
const router = Router();

router.post("/:postId", authenticate, createComment);
router.get('/:postId' , authenticate , getComments)
router.delete('/:commentId' , authenticate , deleteComment)
router.put('/:commentId' , authenticate , updateComment)

export default router;
