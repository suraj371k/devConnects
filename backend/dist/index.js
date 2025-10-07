"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const passport_1 = __importDefault(require("passport"));
require("./config/passport");
const http_1 = require("http");
const socket_1 = require("./config/socket");
//routes imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const comment_routes_1 = __importDefault(require("./routes/comment.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
dotenv_1.default.config({ path: ".env" });
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Middleware should come BEFORE Socket.IO initialization
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(passport_1.default.initialize());
// MongoDB connection
(0, db_1.connectDb)();
// Initialize Socket.IO AFTER middleware but BEFORE routes
const io = (0, socket_1.initializeSocket)(httpServer);
// Remove setIOInstance(io) - it should be handled inside initializeSocket
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/post", post_routes_1.default);
app.use("/api/user", user_routes_1.default);
app.use("/api/comment", comment_routes_1.default);
app.use("/api/message", message_routes_1.default);
app.use("/api/notification", notification_routes_1.default);
// Sample route
app.get("/api/hello", (_req, res) => {
    res.json({ message: "Hello from TypeScript Express backend!" });
});
const PORT = process.env.PORT || 6000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
