import { Request, Response } from "express";
import { LoginUserInput, RegisterUserInput } from "../schema/user.schema";
import bcrypt from "bcryptjs";
import User from "../models/user.model";
import jwt from "jsonwebtoken";
import Post from "../models/post.model";

export const register = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response
) => {
  try {
    const { name, email, password, dob } = req.body;

    if (!name || !email || !password || !dob) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill required fields" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, dob, password: hashedPassword });

    await user.save();

    // sanitize user object to avoid sending password
    const sanitizedUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: (user as any).avatar,
      dob: (user as any).dob,
      about: (user as any).about,
      location: (user as any).location,
      github: (user as any).github,
      linkedin: (user as any).linkedin,
  website: (user as any).website || (user as any).websites,
      experience: (user as any).experience || [],
      followers: (user as any).followers || [],
      following: (user as any).following || [],
      createdAt: (user as any).createdAt,
    };

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      user: sanitizedUser,
    });
  } catch (error) {
    console.log("Error in register user controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const login = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are require" });
    }

    const user = await User.findOne({ email });

    if (!user || !user.password) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // return a fuller user payload so frontend has profile fields available
    const sanitizedUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: (user as any).avatar,
      dob: (user as any).dob,
      about: (user as any).about,
      location: (user as any).location,
      github: (user as any).github,
      linkedin: (user as any).linkedin,
  website: (user as any).website || (user as any).websites,
      experience: (user as any).experience || [],
      followers: (user as any).followers || [],
      following: (user as any).following || [],
      createdAt: (user as any).createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Error in login user controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log("error in logout controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const profile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId)
      .populate("following", "_id name email")
      .populate("followers", "_id name email");

    const posts = await Post.find({author: userId})

    

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    return res.status(200).json({ success: true, user , posts: posts || []  });
  } catch (error) {
    console.log("Error in profile controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as
      | { _id: string; email: string; name: string }
      | undefined;

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Google authentication failed" });
    }

    const token = jwt.sign(
      { id: (user as any)._id, email: (user as any).email },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in Google callback controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
