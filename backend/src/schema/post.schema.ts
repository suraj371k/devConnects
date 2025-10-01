import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be atleast 3 characters long"),
  content: z.string().min(10, "Content must be atleast 10 character long"),
  images: z.array(z.string().url("Image must be a valid url")).optional().default([]),
  likes: z.array(z.string()).optional().default([]),
  comments: z.array(z.string()).optional().default([]),
});

export type PostInput = z.infer<typeof postSchema>;
