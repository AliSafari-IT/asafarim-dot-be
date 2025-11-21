// packages/helpers/src/datetime.ts

export function formatDate(
    date: Date | string | null | undefined,
    locale = "en-US"
): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString(locale);
}

export function formatDateTime(
    date: Date | string | null | undefined,
    locale = "en-US"
): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return isNaN(d.getTime()) ? "-" : d.toLocaleString(locale);
}

export function formatTime(
    date: Date | string | null | undefined,
    locale = "en-US"
): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    return isNaN(d.getTime()) ? "-" : d.toLocaleTimeString(locale);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    const diffMs = d.getTime() - new Date().getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (Math.abs(diffSecs) < 60) return "just now";
    if (Math.abs(diffMins) < 60) return `${Math.abs(diffMins)}m ${diffMins < 0 ? "ago" : ""}`;
    if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)}h ${diffHours < 0 ? "ago" : ""}`;
    return `${Math.abs(diffDays)}d ${diffDays < 0 ? "ago" : ""}`;
}

export function isToday(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

export function isPast(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    const d = typeof date === "string" ? new Date(date) : date;
    return !isNaN(d.getTime()) && d.getTime() < new Date().getTime();
}

export function isFuture(date: Date | string | null | undefined): boolean {
    if (!date) return false;
    const d = typeof date === "string" ? new Date(date) : date;
    return !isNaN(d.getTime()) && d.getTime() > new Date().getTime();
}

export function addDays(date: Date | string | null | undefined, days: number): Date | null {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setDate(d.getDate() + days);
    return d;
}

export function startOfDay(date: Date | string | null | undefined): Date | null {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
}

export function endOfDay(date: Date | string | null | undefined): Date | null {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : new Date(date);
    if (isNaN(d.getTime())) return null;
    d.setHours(23, 59, 59, 999);
    return d;
}
