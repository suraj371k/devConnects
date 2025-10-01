import { Router } from "express";
import { loginUser, registerUser } from "../schema/user.schema";
import {
  login,
  logout,
  profile,
  register,
} from "../controllers/auth.controller";
import { validate } from "../middlewares/validation";
import { authenticate } from "../middlewares/authenticate";
import passport from "passport";
import { googleCallback } from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerUser), register);

router.post("/login", validate(loginUser), login);

router.post("/logout", authenticate, logout);

router.get("/profile", authenticate, profile);

// Google OAuth
router.get(
  	"/google",
  	passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  	"/google/callback",
  	passport.authenticate("google", { failureRedirect: "/api/user/google/failure", session: false }),
  	googleCallback
);

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
  

export default router;
