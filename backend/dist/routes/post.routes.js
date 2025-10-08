"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_1 = require("../middlewares/validation");
const post_schema_1 = require("../schema/post.schema");
const authenticate_1 = require("../middlewares/authenticate");
const post_controller_1 = require("../controllers/post.controller");
const upload_1 = require("../middlewares/upload");
const router = (0, express_1.Router)();
router.post("/create", authenticate_1.authenticate, upload_1.upload.array("images", 10), (0, validation_1.validate)(post_schema_1.postSchema), post_controller_1.createPost);
router.get('/my-posts', authenticate_1.authenticate, post_controller_1.getUsersPosts);
router.get('/liked', authenticate_1.authenticate, post_controller_1.likedPosts);
// public route to get posts for a specific user id
router.get('/user/:id', post_controller_1.getPostsByUser);
router.get('/user/:id/liked', post_controller_1.getLikedPostsByUser);
router.get('/', post_controller_1.getPosts);
router.delete('/:id', authenticate_1.authenticate, post_controller_1.deletePost);
router.put('/:id', authenticate_1.authenticate, upload_1.upload.array('images', 10), post_controller_1.updatePost);
exports.default = router;
