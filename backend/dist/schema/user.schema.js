"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const zod_1 = require("zod");
exports.registerUser = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    dob: zod_1.z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), zod_1.z.date()),
});
exports.loginUser = zod_1.z.object({
    password: zod_1.z.string(),
    email: zod_1.z.string().email(),
});
