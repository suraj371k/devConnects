import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  followers,
  followUser,
  getSuggestedUser,
  toggleLike,
  unfollowUser,
  users,
} from "../controllers/user.controller";
const router = Router();

router.put("/:id/like", authenticate, toggleLike);

router.post("/:targetUser/follow", authenticate, followUser);

router.delete("/:targetUser/unfollow", authenticate, unfollowUser);

router.get('/suggested' , authenticate , getSuggestedUser)

router.get('/followers' , authenticate , followers)

router.get('/' , users)

export default router;
