import { z } from "zod";

export const commentSchema = z.object({
  user: z.string().min(1, "User ID is required"), // ObjectId as string
  post: z.string().min(1, "Post ID is required"), // ObjectId as string
  text: z.string().min(1, "Comment text is required"),
  createdAt: z.date().optional(),
});

export type CommentInput = z.infer<typeof commentSchema>;
