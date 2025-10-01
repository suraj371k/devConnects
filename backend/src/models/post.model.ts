import mongoose, { model, Schema, Types } from "mongoose";

interface IPost {
  author: Types.ObjectId;
  title: string;
  content: string;
  images?: string[];
  likes: Types.ObjectId[];
  comments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post" , postSchema)

export default Post;