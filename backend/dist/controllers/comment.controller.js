"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComment = exports.deleteComment = exports.getComments = exports.createComment = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const createComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { text } = req.body;
        const { postId } = req.params;
        if (!text) {
            return res
                .status(400)
                .json({ success: false, message: "Text is required to comment" });
        }
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res
                .status(400)
                .json({ success: false, message: "Post not found" });
        }
        //create comment
        const comment = await comment_model_1.default.create({
            user: userId,
            post: postId,
            text,
        });
        await notification_model_1.default.create({
            from: userId,
            to: post.author,
            type: "comment",
            read: false,
        });
        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            comment,
        });
    }
    catch (error) {
        console.error("Error is comment controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.createComment = createComment;
//get comments
const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            return res
                .status(400)
                .json({ success: false, message: "Post not found" });
        }
        const comments = await comment_model_1.default.find({ post: postId }).populate("user", "email name");
        return res.status(200).json({ success: true, comments });
    }
    catch (error) {
        console.error("Error is comment controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.getComments = getComments;
//delte commment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const comment = await comment_model_1.default.findById(commentId);
        if (!comment) {
            return res
                .status(400)
                .json({ success: false, message: "Comment not found" });
        }
        await comment_model_1.default.findByIdAndDelete(commentId);
        return res
            .status(200)
            .json({ success: true, message: "Comment deleted successfully" });
    }
    catch (error) {
        console.error("Error is delete comment controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.deleteComment = deleteComment;
const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const comment = await comment_model_1.default.findById(commentId);
        if (!comment) {
            return res
                .status(404)
                .json({ success: false, message: "Comment not found" });
        }
        const updatedComment = await comment_model_1.default.findByIdAndUpdate(commentId, { text }, { new: true });
        return res.status(201).json({ success: true, updatedComment });
    }
    catch (error) {
        console.error("Error is delete comment controller", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.updateComment = updateComment;
