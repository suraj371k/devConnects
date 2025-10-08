"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middlewares/authenticate");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
router.put("/:id/like", authenticate_1.authenticate, user_controller_1.toggleLike);
router.post("/:targetUser/follow", authenticate_1.authenticate, user_controller_1.followUser);
router.delete("/:targetUser/unfollow", authenticate_1.authenticate, user_controller_1.unfollowUser);
router.get('/suggested', authenticate_1.authenticate, user_controller_1.getSuggestedUser);
router.get('/followers', authenticate_1.authenticate, user_controller_1.followers);
router.put('/profile/update', authenticate_1.authenticate, user_controller_1.updateProfile);
// Make user profile by id public so other users can view profiles without
// being authenticated. Protected actions (update/follow/unfollow) remain
// behind authentication.
router.get('/:id', user_controller_1.getProfileById);
router.get('/', authenticate_1.authenticate, user_controller_1.users);
exports.default = router;
