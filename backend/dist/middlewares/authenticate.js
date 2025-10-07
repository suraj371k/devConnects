"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    try {
        console.log("Auth middleware - Cookies:", req.cookies);
        console.log("Auth middleware - Headers:", req.headers);
        const token = req.cookies?.token;
        if (!token) {
            console.log("No token found in cookies");
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Token not found",
            });
        }
        console.log("Token found:", token);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);
        // attach decoded data (like userId) to req for later use
        req.user = decoded;
        next(); // pass control to the next middleware/route handler
    }
    catch (error) {
        console.log("JWT verification error:", error);
        return res
            .status(403)
            .json({ success: false, message: "Invalid or expired token" });
    }
};
exports.authenticate = authenticate;
