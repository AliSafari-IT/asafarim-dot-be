import type { ResumeSectionItem } from "./ResumeSectionItemsView";
import { isProduction } from "@asafarim/shared-ui-react";

/**
 * Helper function to convert any DTO array to ResumeSectionItem array
 * This is needed because TypeScript doesn't recognize that our DTOs are compatible with ResumeSectionItem
 * even though they all have an 'id' property and can be indexed with string keys
 */
export function convertToResumeSectionItems<T extends { id: string }>(
  items: T[]
): ResumeSectionItem[] {
  return items as unknown as ResumeSectionItem[];
}

export const getReturnUrl = (url: string) => isProduction? `https://identity.asafarim.be/login?returnUrl=${encodeURIComponent(url)}` : `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(url)}`;