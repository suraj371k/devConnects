"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = __importDefault(require("../models/user.model"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: '.env' });
const callbackURL = process.env.GOOGLE_CALLBACK_URL ||
    "http://localhost:7000/api/auth/google/callback";
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const primaryEmail = profile.emails?.[0]?.value;
        if (!primaryEmail) {
            return done(new Error("No email provided by Google"), undefined);
        }
        let user = await user_model_1.default.findOne({ email: primaryEmail });
        if (!user) {
            // Check if an account exists to link
            const existingUser = await user_model_1.default.findOne({ email: primaryEmail });
            if (existingUser) {
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null, existingUser);
            }
            user = await new user_model_1.default({
                googleId: profile.id,
                name: profile.displayName,
                email: primaryEmail,
                dob: new Date(),
            }).save();
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;
