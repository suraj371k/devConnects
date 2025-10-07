import { Schema, model } from "mongoose";

interface IExperience {
  title: string;
  company: string;
  description: string;
  from: Date;
  to: Date;
}

interface IUser {
  name: string;
  email: string;
  password?: string;
  dob: Date;
  googleId?: string;
  about?: string;
  experience?: IExperience[];
  location?: string;
  linkedin?: string;
  github?: string;
  websites?: string;
  followers?: Schema.Types.ObjectId[];
  following?: Schema.Types.ObjectId[];
  createdAt: Date;
}

const experienceSchema = new Schema<IExperience>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String },
  from: { type: Date, required: true },
  to: { type: Date }, // can be null if ongoing
});

const userSchema = new Schema<IUser>(
  {
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
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema);

export default User;
