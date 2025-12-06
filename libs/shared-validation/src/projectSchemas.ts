import { z } from "zod";
import {
    idSchema,
    nonEmptyString,
    optionalNonEmptyString,
    isoDateString,
    visibilitySchema,
    statusSchema,
    urlSchema,
    tagArraySchema
} from "./common";

export const projectBaseSchema = z.object({
    title: nonEmptyString(3, 200),
    slug: z
        .string()
        .trim()
        .min(3)
        .max(200)
        .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and hyphens."),
    shortDescription: nonEmptyString(10, 500),
    description: nonEmptyString(20, 5000),
    status: statusSchema.default("Draft"),
    visibility: visibilitySchema.default("Public"),
    techStack: tagArraySchema,
    tags: tagArraySchema,
    startDate: isoDateString.optional(),
    endDate: isoDateString.optional(),
    budget: z.number().nonnegative().optional(),
    isFeatured: z.boolean().optional(),
    repoUrl: urlSchema.optional(),
    demoUrl: urlSchema.optional()
});

// Add date validation refinement
export const projectSchemaWithDates = projectBaseSchema.refine(
    (data) =>
        !data.startDate ||
        !data.endDate ||
        new Date(data.endDate) >= new Date(data.startDate),
    {
        message: "End date must be after start date.",
        path: ["endDate"]
    }
);

export const createProjectSchema = projectSchemaWithDates;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectBaseSchema.extend({
    id: idSchema
}).refine(
    (data) =>
        !data.startDate ||
        !data.endDate ||
        new Date(data.endDate) >= new Date(data.startDate),
    {
        message: "End date must be after start date.",
        path: ["endDate"]
    }
);

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
