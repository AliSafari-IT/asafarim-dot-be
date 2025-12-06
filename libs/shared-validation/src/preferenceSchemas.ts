import { z } from "zod";
import { visibilitySchema } from "./common";

export const themePreferenceSchema = z.object({
  isDarkTheme: z.boolean().optional(),
  fontSize: z
    .number()
    .int()
    .min(10)
    .max(32)
    .optional(),
  accentColor: z.string().max(50).optional()
});

export const geoPreferenceSchema = z.object({
  country: z.string().max(100).optional(),
  currency: z.string().max(10).optional(),
  timeZone: z.string().max(100).optional(),
  dateFormat: z.string().max(20).optional()
});

export const notificationPreferenceSchema = z.object({
  receiveEmailNotifications: z.boolean().optional(),
  receiveSmsNotifications: z.boolean().optional(),
  notificationFrequencyInHours: z
    .number()
    .int()
    .min(1)
    .max(24 * 7)
    .optional()
});

export const privacyPreferenceSchema = z.object({
  isProfilePublic: z.boolean().optional(),
  allowSearchByEmail: z.boolean().optional(),
  enableTwoFactorAuthentication: z.boolean().optional()
});

export const accessibilityPreferenceSchema = z.object({
  enableHighContrastMode: z.boolean().optional(),
  enableScreenReaderSupport: z.boolean().optional(),
  textScalingFactor: z.number().min(0.5).max(3).optional()
});

export const miscellaneousPreferenceSchema = z.object({
  preferredFileFormat: z.string().max(20).optional(),
  itemsPerPage: z.number().int().min(5).max(100).optional(),
  enableAutoSave: z.boolean().optional(),
  enableRealTimeUpdates: z.boolean().optional(),
  defaultDashboardView: z.string().max(100).optional()
});

export const userPreferenceSchema = z.object({
  theme: themePreferenceSchema.optional(),
  geo: geoPreferenceSchema.optional(),
  notifications: notificationPreferenceSchema.optional(),
  privacy: privacyPreferenceSchema.optional(),
  accessibility: accessibilityPreferenceSchema.optional(),
  misc: miscellaneousPreferenceSchema.optional()
});

export type UserPreferenceInput = z.infer<typeof userPreferenceSchema>;
