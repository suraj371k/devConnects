"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSchema = void 0;
const zod_1 = require("zod");
exports.postSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, "Title must be atleast 3 characters long"),
    content: zod_1.z.string().min(10, "Content must be atleast 10 character long"),
    images: zod_1.z.array(zod_1.z.string().url("Image must be a valid url")).optional().default([]),
    likes: zod_1.z.array(zod_1.z.string()).optional().default([]),
    comments: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
