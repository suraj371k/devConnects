"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_schema_1 = require("../schema/user.schema");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middlewares/validation");
const authenticate_1 = require("../middlewares/authenticate");
const passport_1 = __importDefault(require("passport"));
const auth_controller_2 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_1.validate)(user_schema_1.registerUser), auth_controller_1.register);
router.post("/login", (0, validation_1.validate)(user_schema_1.loginUser), auth_controller_1.login);
router.post("/logout", authenticate_1.authenticate, auth_controller_1.logout);
router.get("/profile", authenticate_1.authenticate, auth_controller_1.profile);
// Google OAuth
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/api/user/google/failure", session: false }), auth_controller_2.googleCallback);
router.get("/google/failure", (_req, res) => {
    return res.status(401).json({ success: false, message: "Google authentication failed" });
});
// routes/auth.routes.ts
router.get("/test-cookie", (req, res) => {
    console.log("Cookies received:", req.cookies);
    console.log("Token cookie:", req.cookies?.token);
    res.json({
        success: true,
        cookies: req.cookies,
        tokenExists: !!req.cookies?.token
    });
});
exports.default = router;
