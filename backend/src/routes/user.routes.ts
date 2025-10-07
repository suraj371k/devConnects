import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import {
  followers,
  followUser,
  getProfileById,
  getSuggestedUser,
  toggleLike,
  unfollowUser,
  updateProfile,
  users,
} from "../controllers/user.controller";
const router = Router();

router.put("/:id/like", authenticate, toggleLike);

router.post("/:targetUser/follow", authenticate, followUser);

router.delete("/:targetUser/unfollow", authenticate, unfollowUser);

router.get('/suggested' , authenticate , getSuggestedUser)

router.get('/followers' , authenticate , followers)

router.put('/profile/update'  , authenticate , updateProfile)

// Make user profile by id public so other users can view profiles without
// being authenticated. Protected actions (update/follow/unfollow) remain
// behind authentication.
router.get('/:id', getProfileById)

router.get('/' , authenticate , users)

export default router;
