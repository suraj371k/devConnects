import { Schema, model, Types } from "mongoose";

interface IComment {
  user: Types.ObjectId; // reference to User
  post: Types.ObjectId; // reference to Post
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true} }
);

const Comment = model<IComment>("Comment", commentSchema);

export default Comment;
