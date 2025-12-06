import { z } from "zod";
import { nonEmptyString } from "./common";

// Password validation with strength requirements
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password too long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

// Basic password (less strict, for login)
export const basicPasswordSchema = z
  .string()
  .min(1, "Password is required.");

// Email schema
export const emailSchema = z
  .string()
  .email("Invalid email address.")
  .max(255, "Email too long.");

// Register schema (matches identity-portal RegisterForm)
export const registerSchema = z.object({
  email: emailSchema,
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
  confirmPassword: z.string().min(1, "Confirm password is required.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema (matches identity-portal LoginForm)
export const loginSchema = z.object({
  email: emailSchema,
  password: basicPasswordSchema,
  rememberMe: z.boolean().optional()
});

export type LoginInput = z.infer<typeof loginSchema>;

// Password setup schema (matches identity-portal PasswordSetupForm)
export const passwordSetupSchema = z.object({
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, "Confirm password is required.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
});

export type PasswordSetupInput = z.infer<typeof passwordSetupSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: basicPasswordSchema,
  newPassword: strongPasswordSchema,
  confirmNewPassword: z.string().min(1, "Confirm new password is required.")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match.",
  path: ["confirmNewPassword"]
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: strongPasswordSchema,
  confirmNewPassword: z.string().min(1, "Confirm new password is required.")
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords do not match.",
  path: ["confirmNewPassword"]
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Helper function to validate password strength (for UI feedback)
export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("At least 8 characters");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("At least one uppercase letter");

  if (/[a-z]/.test(password)) score++;
  else feedback.push("At least one lowercase letter");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("At least one number");

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push("At least one special character");

  return { score, feedback };
}
