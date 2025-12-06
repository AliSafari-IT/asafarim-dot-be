import { z } from "zod";

export const idSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(3)
  .max(200)
  .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens.");

export const nonEmptyString = (min = 1, max = 500) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters.`)
    .max(max, `Must be at most ${max} characters.`);

export const optionalNonEmptyString = (min = 1, max = 500) =>
  z
    .string()
    .trim()
    .min(min, `Must be at least ${min} characters.`)
    .max(max, `Must be at most ${max} characters.`)
    .optional();

export const isoDateString = z
  .string()
  .refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "Invalid date format; must be ISO date string."
  );

export const difficultySchema = z.enum(["Beginner", "Intermediate", "Advanced"]);

export const visibilitySchema = z.enum(["Public", "Private", "Unlisted"]);

export const statusSchema = z.enum(["Draft", "Published", "Archived"]);

export const urlSchema = z
  .string()
  .url("Must be a valid URL.")
  .max(2000, "URL too long.");

export const tagArraySchema = z
  .array(nonEmptyString(1, 50))
  .max(50, "Too many tags (max 50).")
  .optional();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});
