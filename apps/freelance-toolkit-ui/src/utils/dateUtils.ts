/**
 * Utility functions for formatting durations in human-readable formats.
 * Matches the backend DurationFormatter logic for consistency.
 */

/**
 * Converts minutes to a compact string format suitable for UI display.
 * Examples: 25 → "25m", 90 → "1h 30m", 10080 → "1w", 11520 → "1w 1d"
 */
export function formatDurationCompact(minutes: number): string {
    if (minutes <= 0) return "0m";

    const parts: string[] = [];

    const weeks = Math.floor(minutes / (7 * 24 * 60));
    let remaining = minutes % (7 * 24 * 60);

    const days = Math.floor(remaining / (24 * 60));
    remaining = remaining % (24 * 60);

    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;

    if (weeks > 0) parts.push(`${weeks}w`);
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);

    return parts.join(" ");
}

/**
 * Converts minutes to a human-readable string format suitable for email and text.
 * Examples: 25 → "25 minutes", 90 → "1 hour 30 minutes", 10080 → "1 week", 11520 → "1 week 1 day"
 */
export function formatDurationHuman(minutes: number): string {
    if (minutes <= 0) return "0 minutes";

    const parts: string[] = [];

    const weeks = Math.floor(minutes / (7 * 24 * 60));
    let remaining = minutes % (7 * 24 * 60);

    const days = Math.floor(remaining / (24 * 60));
    remaining = remaining % (24 * 60);

    const hours = Math.floor(remaining / 60);
    const mins = remaining % 60;

    if (weeks > 0) {
        parts.push(weeks === 1 ? "1 week" : `${weeks} weeks`);
    }
    if (days > 0) {
        parts.push(days === 1 ? "1 day" : `${days} days`);
    }
    if (hours > 0) {
        parts.push(hours === 1 ? "1 hour" : `${hours} hours`);
    }
    if (mins > 0) {
        parts.push(mins === 1 ? "1 minute" : `${mins} minutes`);
    }

    if (parts.length === 0) return "0 minutes";
    if (parts.length === 1) return parts[0];

    // Join with commas and "and" for proper English grammar
    return parts
        .map((part, index) => (index === parts.length - 1 ? `and ${part}` : part))
        .join(" ");
}
