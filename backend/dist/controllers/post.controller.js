"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.deletePost = exports.getPosts = exports.createPost = void 0;
const fs_1 = __importDefault(require("fs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const post_model_1 = __importDefault(require("../models/post.model"));
const createPost = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Unauthorize, user not found" });
        }
        const { title, content } = req.body;
        const files = req.files;
        let imageUrls = [];
        if (files && files.length > 0) {
            try {
                // Upload all images in parallel
                const uploadResults = await Promise.all(files.map((file) => cloudinary_1.default.uploader.upload(file.path, {
                    folder: "posts",
                })));
                // Cleanup local files in parallel (best-effort)
                await Promise.all(files.map((file) => fs_1.default.promises.unlink(file.path).catch((err) => {
                    console.error("Error deleting local file:", err);
                })));
                imageUrls = uploadResults.map((result) => result.secure_url);
            }
            catch (uploadError) {
                console.error("Error uploading images:", uploadError);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading images",
                });
            }
        }
        if (!title || !content) {
            return res
                .status(400)
                .json({ success: false, message: "Please add required fields" });
        }
        const newPost = new post_model_1.default({
            author: user._id,
            title,
            content,
            images: imageUrls,
            likes: [],
            comments: [],
        });
        await newPost.save();
        const populatedPost = await newPost.populate("author", "name email");
        return res.status(201).json({ success: true, populatedPost });
    }
    catch (error) {
        console.log("Error in create post");
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.createPost = createPost;
const getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const posts = await post_model_1.default.find()
            .populate("author", "name email")
            .populate("comments", "text")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalPosts = await post_model_1.default.countDocuments();
        if (!posts) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }
        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            count: totalPosts,
            posts: posts,
        });
    }
    catch (error) {
        console.log("Error in get posts controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.getPosts = getPosts;
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const post = await post_model_1.default.findById(id);
        if (!id) {
            return res
                .status(404)
                .json({ success: false, message: "post not found" });
        }
        if (post?.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this post",
            });
        }
        await post_model_1.default.findByIdAndDelete(id);
        return res
            .status(200)
            .json({ success: true, message: "Post deleted successfully" });
    }
    catch (error) {
        console.log("Error in delete posts controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.deletePost = deletePost;
const updatePost = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const post = await post_model_1.default.findById(id);
        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "Post not found" });
        }
        // Check ownership
        if (post.author.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this post",
            });
        }
        const { title, content } = req.body;
        const files = req.files;
        let imageUrls = post.images ?? [];
        // If new images uploaded, upload to Cloudinary
        if (files && files.length > 0) {
            try {
                const uploadResults = await Promise.all(files.map(async (file) => {
                    const result = await cloudinary_1.default.uploader.upload(file.path, {
                        folder: "posts",
                    });
                    // delete local file after upload
                    try {
                        await fs_1.default.promises.unlink(file.path);
                    }
                    catch (err) {
                        console.error("Error deleting local file:", err);
                    }
                    return result.secure_url;
                }));
                // Replace old images with new ones (or you can merge if you want)
                imageUrls = uploadResults;
            }
            catch (err) {
                console.error("Error uploading images:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error uploading images",
                });
            }
        }
        // Update post
        post.title = title || post.title;
        post.content = content || post.content;
        post.images = imageUrls;
        await post.save();
        return res
            .status(200)
            .json({ success: true, message: "Post updated successfully", post });
    }
    catch (error) {
        console.log("Error in update post controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.updatePost = updatePost;
