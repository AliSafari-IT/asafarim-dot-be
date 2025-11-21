export function truncateAtWord(text: string | undefined, max = 100): string {
    if (!text) return "-";

    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;

    const slice = trimmed.slice(0, max);
    const lastSpace = slice.lastIndexOf(" ");

    const cut = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
    return cut + "...";
}

/** Capitalize the first character of a string. */
export function capitalize(text: string | null | undefined): string {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Convert string to title case (capitalize each word). */
export function toTitleCase(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .split(/\s+/)
        .map((word) => capitalize(word))
        .join(" ");
}

/** Convert string to camelCase. */
export function toCamelCase(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
            index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, "");
}

/** Convert string to kebab-case. */
export function toKebabCase(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/\s+/g, "-")
        .toLowerCase();
}

/** Convert string to snake_case. */
export function toSnakeCase(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/\s+/g, "_")
        .toLowerCase();
}

/** Check if string is empty or only whitespace. */
export function isEmpty(text: string | null | undefined): boolean {
    return !text || text.trim().length === 0;
}

/** Pad string to a specific length. */
export function padStart(
    text: string | null | undefined,
    length: number,
    padChar = " "
): string {
    if (!text) return padChar.repeat(length);
    return String(text).padStart(length, padChar);
}

/** Remove all whitespace from string. */
export function removeWhitespace(text: string | null | undefined): string {
    if (!text) return "";
    return text.replace(/\s+/g, "");
}

/** Reverse a string. */
export function reverse(text: string | null | undefined): string {
    if (!text) return "";
    return text.split("").reverse().join("");
}

/** Check if string contains only alphanumeric characters. */
export function isAlphanumeric(text: string | null | undefined): boolean {
    if (!text) return false;
    return /^[a-zA-Z0-9]+$/.test(text);
}

/** Slugify a string (lowercase, kebab-case, remove special chars). */
export function slugify(text: string | null | undefined): string {
    if (!text) return "";
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

