import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("Decoded token:", decoded);

    // attach decoded data (like userId) to req for later use
    (req as any).user = decoded;

    next(); // pass control to the next middleware/route handler
  } catch (error) {
    console.log("JWT verification error:", error);
    return res
      .status(403)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
