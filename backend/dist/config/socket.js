"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIOInstance = exports.setIOInstance = exports.initializeSocket = exports.onlineUsers = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_1 = __importDefault(require("cookie"));
exports.onlineUsers = new Map();
let ioInstance = null;
const initializeSocket = (httpServer) => {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "https://dev-connects.vercel.app",
            credentials: true,
        },
    });
    // Set instance immediately
    (0, exports.setIOInstance)(io);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET environment variable is required");
    }
    io.use((socket, next) => {
        try {
            // Parse cookies from handshake headers
            const cookies = cookie_1.default.parse(socket.handshake.headers.cookie || '');
            // Get token from cookies (adjust the name based on your cookie name)
            const token = cookies.token || cookies.accessToken || cookies.jwt;
            if (!token) {
                console.log("❌ No token found in cookies");
                return next(new Error("No token provided"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            socket.data.userId = decoded.id;
            next();
        }
        catch (error) {
            console.log("❌ JWT verification failed:", error);
            next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.data.userId;
        console.log(`User connected: ${userId}`);
        exports.onlineUsers.set(userId, socket.id);
        io.emit("getOnlineUsers", Array.from(exports.onlineUsers.keys()));
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${userId}`);
            exports.onlineUsers.delete(userId);
            io.emit("getOnlineUsers", Array.from(exports.onlineUsers.keys()));
        });
    });
    return io;
};
exports.initializeSocket = initializeSocket;
const setIOInstance = (io) => {
    ioInstance = io;
};
exports.setIOInstance = setIOInstance;
const getIOInstance = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO not initialized. Call initializeSocket first.");
    }
    return ioInstance;
};
exports.getIOInstance = getIOInstance;
