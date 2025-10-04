import type { ResumeSectionItem } from "./ResumeSectionItemsView";

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
