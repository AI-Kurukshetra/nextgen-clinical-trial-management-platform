import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  fullName: z
    .string()
    .max(120, "Full name is too long.")
    .optional()
    .or(z.literal("")),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

