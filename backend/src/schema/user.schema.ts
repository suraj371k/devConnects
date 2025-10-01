import { z } from "zod";

export const registerUser = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  dob: z.preprocess((val) => (typeof val === 'string' ? new Date(val) : val), z.date()),
});

export const loginUser = z.object({
  password: z.string(),
  email: z.string().email(),
});

export type RegisterUserInput = z.infer<typeof registerUser>

export type LoginUserInput = z.infer<typeof loginUser>