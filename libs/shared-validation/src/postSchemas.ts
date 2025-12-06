import { z } from "zod";
import {
  idSchema,
  nonEmptyString,
  optionalNonEmptyString,
  slugSchema,
  difficultySchema,
  statusSchema,
  visibilitySchema,
  tagArraySchema
} from "./common";

export const postBaseSchema = z.object({
  title: nonEmptyString(5, 200),
  slug: slugSchema,
  summary: optionalNonEmptyString(10, 500),
  excerpt: optionalNonEmptyString(10, 500),
  content: nonEmptyString(20, 20000),
  topicId: idSchema.optional(),
  difficulty: difficultySchema.default("Intermediate"),
  status: statusSchema.default("Draft"),
  visibility: visibilitySchema.default("Public"),
  tags: tagArraySchema,
  categories: tagArraySchema,
  thumbnailUrl: z.string().url("Invalid thumbnail URL").optional()
});

export const createPostSchema = postBaseSchema;

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = postBaseSchema.extend({
  id: idSchema
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
