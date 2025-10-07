using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Core.Api.Utilities;

public static class SlugGenerator
{
    private const string AllowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";
    private const int DefaultSlugLength = 10;

    // List of offensive/reserved words to avoid (can be expanded)
    private static readonly string[] ReservedWords = new[]
    {
        "admin",
        "api",
        "public",
        "private",
        "system",
        "root",
        "test",
    };

    /// <summary>
    /// Generates a cryptographically secure random slug
    /// </summary>
    public static string GenerateSecureSlug(int length = DefaultSlugLength)
    {
        var slug = new StringBuilder(length);
        var randomBytes = new byte[length];

        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }

        foreach (var b in randomBytes)
        {
            slug.Append(AllowedChars[b % AllowedChars.Length]);
        }

        return slug.ToString();
    }

    /// <summary>
    /// Validates a custom slug according to security and format rules
    /// </summary>
    public static (bool IsValid, string? ErrorMessage) ValidateSlug(string slug)
    {
        if (string.IsNullOrWhiteSpace(slug))
        {
            return (false, "Slug cannot be empty");
        }

        slug = slug.Trim().ToLowerInvariant();

        // Length validation
        if (slug.Length < 4)
        {
            return (false, "Slug must be at least 4 characters long");
        }

        if (slug.Length > 100)
        {
            return (false, "Slug cannot exceed 100 characters");
        }

        // Character validation - only lowercase letters, numbers, and hyphens
        if (!Regex.IsMatch(slug, @"^[a-z0-9\-]+$"))
        {
            return (false, "Slug can only contain lowercase letters, numbers, and hyphens");
        }

        // Cannot start or end with hyphen
        if (slug.StartsWith("-") || slug.EndsWith("-"))
        {
            return (false, "Slug cannot start or end with a hyphen");
        }

        // Cannot have consecutive hyphens
        if (slug.Contains("--"))
        {
            return (false, "Slug cannot contain consecutive hyphens");
        }

        // Check against reserved words
        if (ReservedWords.Contains(slug))
        {
            return (false, "This slug is reserved and cannot be used");
        }

        return (true, null);
    }

    /// <summary>
    /// Sanitizes a custom slug by applying validation rules
    /// </summary>
    public static string SanitizeSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        // Convert to lowercase and trim
        var slug = input.Trim().ToLowerInvariant();

        // Replace spaces and underscores with hyphens
        slug = slug.Replace(' ', '-').Replace('_', '-');

        // Remove any characters that aren't lowercase letters, numbers, or hyphens
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Replace multiple consecutive hyphens with single hyphen
        slug = Regex.Replace(slug, @"\-+", "-");

        // Remove leading/trailing hyphens
        slug = slug.Trim('-');

        return slug;
    }
}
