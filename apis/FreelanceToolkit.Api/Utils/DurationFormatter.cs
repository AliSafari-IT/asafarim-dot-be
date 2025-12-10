namespace FreelanceToolkit.Api.Utils;

/// <summary>
/// Utility class for formatting duration values in human-readable formats.
/// Supports both compact UI format (e.g., "1w 2d") and human-readable text (e.g., "1 week 2 days").
/// </summary>
public static class DurationFormatter
{
    /// <summary>
    /// Converts minutes to a compact string format suitable for UI display.
    /// Examples: 25 → "25m", 90 → "1h 30m", 10080 → "1w", 11520 → "1w 1d"
    /// </summary>
    public static string ToCompactString(int minutes)
    {
        if (minutes <= 0)
            return "0m";

        var parts = new List<string>();

        int weeks = minutes / (7 * 24 * 60);
        int remainingAfterWeeks = minutes % (7 * 24 * 60);

        int days = remainingAfterWeeks / (24 * 60);
        int remainingAfterDays = remainingAfterWeeks % (24 * 60);

        int hours = remainingAfterDays / 60;
        int mins = remainingAfterDays % 60;

        if (weeks > 0)
            parts.Add($"{weeks}w");
        if (days > 0)
            parts.Add($"{days}d");
        if (hours > 0)
            parts.Add($"{hours}h");
        if (mins > 0)
            parts.Add($"{mins}m");

        return string.Join(" ", parts);
    }

    /// <summary>
    /// Converts minutes to a human-readable string format suitable for email and text.
    /// Examples: 25 → "25 minutes", 90 → "1 hour 30 minutes", 10080 → "1 week", 11520 → "1 week 1 day"
    /// </summary>
    public static string ToHumanString(int minutes)
    {
        if (minutes <= 0)
            return "0 minutes";

        var parts = new List<string>();

        int weeks = minutes / (7 * 24 * 60);
        int remainingAfterWeeks = minutes % (7 * 24 * 60);

        int days = remainingAfterWeeks / (24 * 60);
        int remainingAfterDays = remainingAfterWeeks % (24 * 60);

        int hours = remainingAfterDays / 60;
        int mins = remainingAfterDays % 60;

        if (weeks > 0)
            parts.Add(weeks == 1 ? "1 week" : $"{weeks} weeks");
        if (days > 0)
            parts.Add(days == 1 ? "1 day" : $"{days} days");
        if (hours > 0)
            parts.Add(hours == 1 ? "1 hour" : $"{hours} hours");
        if (mins > 0)
            parts.Add(mins == 1 ? "1 minute" : $"{mins} minutes");

        if (parts.Count == 0)
            return "0 minutes";

        if (parts.Count == 1)
            return parts[0];

        // Join with commas and "and" for proper English grammar
        return string.Join(
            " ",
            parts.Select((part, index) => index == parts.Count - 1 ? $"and {part}" : part)
        );
    }

    /// <summary>
    /// Calculates duration in minutes from start and end times, then formats as compact string.
    /// </summary>
    public static string ToCompactString(DateTime startTime, DateTime endTime)
    {
        int minutes = (int)(endTime - startTime).TotalMinutes;
        return ToCompactString(minutes);
    }

    /// <summary>
    /// Calculates duration in minutes from start and end times, then formats as human-readable string.
    /// </summary>
    public static string ToHumanString(DateTime startTime, DateTime endTime)
    {
        int minutes = (int)(endTime - startTime).TotalMinutes;
        return ToHumanString(minutes);
    }
}
