import { Request, Response } from "express";
import Post from "../models/post.model";
import mongoose from "mongoose";
import User from "../models/user.model";

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "post not found" });
    }

    if (post.likes.includes(userId)) {
      //unlike
      post.likes = post.likes.filter(
        (likeUserId) => likeUserId.toString() !== userId.toString()
      );
    } else {
      //like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      likes: post.likes,
    });
  } catch (error) {
    console.log("Error in toggleLike controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//post method
export const followUser = async (req: Request, res: Response) => {
  try {
    const { targetUser } = req.params;
    const currentUserId = (req as any).user.id;

    if (
      !mongoose.isValidObjectId(targetUser) ||
      !mongoose.isValidObjectId(currentUserId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user Id format" });
    }

    if (targetUser === currentUserId) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot follow yourself" });
    }

    // Check if both users exist
    const [currentUser, targetUserDoc] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUser),
    ]);

    if (!currentUser || !targetUserDoc) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isAlreadyFollowing = currentUser.following?.some(
      (id) => id.toString() === targetUser
    );
    if (isAlreadyFollowing) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    // Use atomic operations to update both users
    await Promise.all([
      // Add targetUserId to current user's following array
      User.findByIdAndUpdate(
        currentUserId,
        { $addToSet: { following: new mongoose.Types.ObjectId(targetUser) } },
        { new: true }
      ),
      // Add currentUserId to target user's followers array
      User.findByIdAndUpdate(
        targetUser,
        {
          $addToSet: { followers: new mongoose.Types.ObjectId(currentUserId) },
        },
        { new: true }
      ),
    ]);

    res.status(200).json({
      message: "Successfully followed user",
      following: true,
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//delete method
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user.id;
    const targetUser = req.params.targetUser;

    if (
      !mongoose.isValidObjectId(currentUserId) ||
      !mongoose.isValidObjectId(targetUser)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user Id format" });
    }

    if (currentUserId === targetUser) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot unfollow yourself" });
    }

    // Check if both users exist
    const [currentUser, targetUserDoc] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUser),
    ]);

    if (!currentUser || !targetUserDoc) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isFollowing = currentUser.following?.some(
      (id) => id.toString() === targetUser
    );
    if (!isFollowing) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    // Use atomic operations to update both users
    await Promise.all([
      // Remove targetUserId from current user's following array
      User.findByIdAndUpdate(
        currentUserId,
        { $pull: { following: new mongoose.Types.ObjectId(targetUser) } },
        { new: true }
      ),
      // Remove currentUserId from target user's followers array
      User.findByIdAndUpdate(
        targetUser,
        { $pull: { followers: new mongoose.Types.ObjectId(currentUserId) } },
        { new: true }
      ),
    ]);

    res.status(200).json({
      message: "Successfully unfollowed user",
      following: false,
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//get all user
export const users = async (req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("followers", "name email")
      .populate("following", "name email");

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.log("Error in get all users controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//unfollowed user
export const getSuggestedUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    //get all users not followed by this user (excluding yourself)
    const followingIds = Array.isArray(user.following)
      ? user.following.map((id: any) => id.toString())
      : [];
    const excludeIds = [...followingIds, userId.toString()];
    const unfollowedUsers = await User.find({
      _id: { $nin: excludeIds },
    }).select("-password");

    return res.status(200).json({ success: true, users: unfollowedUsers });
  } catch (error) {
    console.error("Error in get unfollowed users controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

//followed user
export const followers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    if (!userId) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const followers = await User.findById(userId)
      .populate("followers", "name email")
      .populate("following", "name email")
      .select("followers");

    return res.status(200).json({ success: true, followers });
  } catch (error) {
    console.log("Error in getting followers", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

