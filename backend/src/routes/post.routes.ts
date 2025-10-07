import { Router } from "express";
import { validate } from "../middlewares/validation";
import { postSchema } from "../schema/post.schema";
import { authenticate } from "../middlewares/authenticate";
import { createPost, deletePost, getLikedPostsByUser, getPosts, getPostsByUser, getUsersPosts, likedPosts, updatePost } from "../controllers/post.controller";
import { upload } from "../middlewares/upload";
const router = Router();

router.post(
  "/create",
  authenticate,
  upload.array("images", 10),
  validate(postSchema),
  createPost
);

router.get('/my-posts' , authenticate , getUsersPosts)

router.get('/liked' , authenticate , likedPosts)

// public route to get posts for a specific user id
router.get('/user/:id', getPostsByUser)
router.get('/user/:id/liked', getLikedPostsByUser)


router.get('/' , getPosts)

router.delete('/:id' , authenticate , deletePost)

router.put(
  '/:id',
  authenticate,
  upload.array('images', 10),
  updatePost
)




export default router;
