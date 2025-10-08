"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const experienceSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String },
    from: { type: Date, required: true },
    to: { type: Date }, // can be null if ongoing
});
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: false,
    },
    dob: {
        type: Date,
        required: true,
    },
    about: {
        type: String,
    },
    location: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    github: {
        type: String,
    },
    websites: {
        type: String,
    },
    experience: [experienceSchema],
    googleId: {
        type: String,
        required: false,
    },
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    following: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
