"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentSchema = void 0;
const zod_1 = require("zod");
exports.commentSchema = zod_1.z.object({
    user: zod_1.z.string().min(1, "User ID is required"), // ObjectId as string
    post: zod_1.z.string().min(1, "Post ID is required"), // ObjectId as string
    text: zod_1.z.string().min(1, "Comment text is required"),
    createdAt: zod_1.z.date().optional(),
});
