import { Request, Response } from "express";
import Post from "../models/post.model";
import Comment from "../models/comment.model";
import Notification from "../models/notification.model";

export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { text } = req.body;
    const { postId } = req.params;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "Text is required to comment" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }

    //create comment
    const comment = await Comment.create({
      user: userId,
      post: postId,
      text,
    });

    await Notification.create({
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
  } catch (error) {
    console.error("Error is comment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }

    const comments = await Comment.find({ post: postId }).populate(
      "user",
      "email name"
    );

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error is comment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//delte commment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: "Comment not found" });
    }

    await Comment.findByIdAndDelete(commentId);

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error is delete comment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );

    return res.status(201).json({ success: true, updatedComment });
  } catch (error) {
    console.error("Error is delete comment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
