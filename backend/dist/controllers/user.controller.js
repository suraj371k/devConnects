"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileById = exports.updateProfile = exports.followers = exports.getSuggestedUser = exports.users = exports.unfollowUser = exports.followUser = exports.toggleLike = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const toggleLike = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const post = await post_model_1.default.findById(id);
        if (!post) {
            return res
                .status(404)
                .json({ success: false, message: "post not found" });
        }
        const isLiked = post.likes.includes(userId);
        if (isLiked) {
            //unlike
            post.likes = post.likes.filter((likeUserId) => likeUserId.toString() !== userId.toString());
        }
        else {
            //like
            post.likes.push(userId);
            //avoid self like
            if (userId.toString() === post.author.toString()) {
                await notification_model_1.default.create({
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
    }
    catch (error) {
        console.log("Error in toggleLike controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.toggleLike = toggleLike;
//post method
const followUser = async (req, res) => {
    try {
        const { targetUser } = req.params;
        const currentUserId = req.user.id;
        if (!mongoose_1.default.isValidObjectId(targetUser) ||
            !mongoose_1.default.isValidObjectId(currentUserId)) {
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
            user_model_1.default.findById(currentUserId),
            user_model_1.default.findById(targetUser),
        ]);
        if (!currentUser || !targetUserDoc) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const isAlreadyFollowing = currentUser.following?.some((id) => id.toString() === targetUser);
        if (isAlreadyFollowing) {
            return res
                .status(400)
                .json({ error: "You are already following this user" });
        }
        // Use atomic operations to update both users
        await Promise.all([
            // Add targetUserId to current user's following array
            user_model_1.default.findByIdAndUpdate(currentUserId, { $addToSet: { following: new mongoose_1.default.Types.ObjectId(targetUser) } }, { new: true }),
            // Add currentUserId to target user's followers array
            user_model_1.default.findByIdAndUpdate(targetUser, {
                $addToSet: { followers: new mongoose_1.default.Types.ObjectId(currentUserId) },
            }, { new: true }),
        ]);
        await notification_model_1.default.create({
            from: currentUserId,
            to: targetUser,
            type: "follow",
            read: false,
        });
        res.status(200).json({
            message: "Successfully followed user",
            following: true,
        });
    }
    catch (error) {
        console.error("Follow error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.followUser = followUser;
//delete method
const unfollowUser = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const targetUser = req.params.targetUser;
        if (!mongoose_1.default.isValidObjectId(currentUserId) ||
            !mongoose_1.default.isValidObjectId(targetUser)) {
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
            user_model_1.default.findById(currentUserId),
            user_model_1.default.findById(targetUser),
        ]);
        if (!currentUser || !targetUserDoc) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const isFollowing = currentUser.following?.some((id) => id.toString() === targetUser);
        if (!isFollowing) {
            return res.status(400).json({ error: "You are not following this user" });
        }
        // Use atomic operations to update both users
        await Promise.all([
            // Remove targetUserId from current user's following array
            user_model_1.default.findByIdAndUpdate(currentUserId, { $pull: { following: new mongoose_1.default.Types.ObjectId(targetUser) } }, { new: true }),
            // Remove currentUserId from target user's followers array
            user_model_1.default.findByIdAndUpdate(targetUser, { $pull: { followers: new mongoose_1.default.Types.ObjectId(currentUserId) } }, { new: true }),
        ]);
        res.status(200).json({
            message: "Successfully unfollowed user",
            following: false,
        });
    }
    catch (error) {
        console.error("Unfollow error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.unfollowUser = unfollowUser;
//get all user
const users = async (req, res) => {
    try {
        const users = await user_model_1.default.find()
            .select("-password")
            .populate("followers", "name email")
            .populate("following", "name email");
        return res.status(200).json({ success: true, users });
    }
    catch (error) {
        console.log("Error in get all users controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.users = users;
//unfollowed user
const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        //get all users not followed by this user (excluding yourself)
        const followingIds = Array.isArray(user.following)
            ? user.following.map((id) => id.toString())
            : [];
        const excludeIds = [...followingIds, userId.toString()];
        const unfollowedUsers = await user_model_1.default.find({
            _id: { $nin: excludeIds },
        }).select("-password");
        return res.status(200).json({ success: true, users: unfollowedUsers });
    }
    catch (error) {
        console.error("Error in get unfollowed users controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.getSuggestedUser = getSuggestedUser;
//followed user
const followers = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const followers = await user_model_1.default.findById(userId)
            .populate("followers", "name email")
            .populate("following", "name email")
            .select("followers");
        return res.status(200).json({ success: true, followers });
    }
    catch (error) {
        console.log("Error in getting followers", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.followers = followers;
//profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { about, experience, location, linkedin, github, websites } = req.body;
        // Validate user existence
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update simple fields
        if (about)
            user.about = about;
        if (location)
            user.location = location;
        if (linkedin)
            user.linkedin = linkedin;
        if (github)
            user.github = github;
        if (websites)
            user.websites = websites;
        // Update experience (array of objects)
        if (experience && Array.isArray(experience)) {
            user.experience = experience.map((exp) => ({
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
    }
    catch (error) {
        console.log("Error in in create profile");
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.updateProfile = updateProfile;
//user profile by id
const getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await user_model_1.default.findById(id)
            .populate("followers", "_id name email")
            .populate("following", "_id name email");
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    }
    catch (error) {
        console.log("Error in in get profile");
        return res.status(500).json({ message: "Server error", error });
    }
};
exports.getProfileById = getProfileById;
