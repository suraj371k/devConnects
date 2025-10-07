import { Request, Response } from "express";
import Post from "../models/post.model";
import mongoose from "mongoose";
import User from "../models/user.model";
import Notification from "../models/notification.model";

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

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      //unlike
      post.likes = post.likes.filter(
        (likeUserId) => likeUserId.toString() !== userId.toString()
      );
    } else {
      //like
      post.likes.push(userId);

      //avoid self like
      if (userId.toString() === post.author.toString()) {
        await Notification.create({
          from: userId,
          to: post.author,
          type: "like",
          read: false,
        });
      }
    }

    await post.save();

    return res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      likes: post.likes,
      message: isLiked ? "Unliked post" : "Liked post",
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

    await Notification.create({
      from: currentUserId,
      to: targetUser,
      type: "follow",
      read: false,
    });

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

//profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { about, experience, location, linkedin, github, websites } =
      req.body;

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update simple fields
    if (about) user.about = about;
    if (location) user.location = location;
    if (linkedin) user.linkedin = linkedin;
    if (github) user.github = github;
    if (websites) user.websites = websites;

    // Update experience (array of objects)
    if (experience && Array.isArray(experience)) {
      user.experience = experience.map((exp: any) => ({
        title: exp.title,
        company: exp.company,
        description: exp.description,
        from: exp.from,
        to: exp.to,
      }));
    }
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error in in create profile");
    return res.status(500).json({ message: "Server error", error });
  }
};

//user profile by id
export const getProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate("followers", "_id name email")
      .populate("following", "_id name email");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.log("Error in in get profile");
    return res.status(500).json({ message: "Server error", error });
  }
};
