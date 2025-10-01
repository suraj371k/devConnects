import { Router } from "express";
import { validate } from "../middlewares/validation";
import { postSchema } from "../schema/post.schema";
import { authenticate } from "../middlewares/authenticate";
import { createPost, deletePost, getPosts, updatePost } from "../controllers/post.controller";
import { upload } from "../middlewares/upload";
const router = Router();

router.post(
  "/create",
  authenticate,
  upload.array("images", 10),
  validate(postSchema),
  createPost
);


router.get('/' , getPosts)

router.delete('/:id' , authenticate , deletePost)

router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  updatePost
)




export default router;
