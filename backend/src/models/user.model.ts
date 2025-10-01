import { Schema, model } from "mongoose";

interface IUser {
  name: string;
  email: string;
  password?: string;
  dob: Date;
  googleId?: string;
  followers?: Schema.Types.ObjectId[];
  following?: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
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
});

const User = model<IUser>("User", userSchema);

export default User;
