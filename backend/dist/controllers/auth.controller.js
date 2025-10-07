"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.profile = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = async (req, res) => {
    try {
        const { name, email, password, dob } = req.body;
        if (!name || !email || !password || !dob) {
            return res
                .status(400)
                .json({ success: false, message: "Please fill required fields" });
        }
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: "User already exist" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new user_model_1.default({ name, email, dob, password: hashedPassword });
        await user.save();
        return res.status(201).json({
            success: true,
            message: "user created successfully",
            user: { name, email, password },
        });
    }
    catch (error) {
        console.log("Error in register user controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are require" });
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user || !user.password) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error("Error in login user controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.login = login;
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res
            .status(200)
            .json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.log("error in logout controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.logout = logout;
const profile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await user_model_1.default.findById(userId)
            .populate("following", "_id name email")
            .populate("followers", "_id name email");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "user not found" });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.log("Error in profile controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.profile = profile;
const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res
                .status(401)
                .json({ success: false, message: "Google authentication failed" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(redirectUrl);
    }
    catch (error) {
        console.error("Error in Google callback controller", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};
exports.googleCallback = googleCallback;
