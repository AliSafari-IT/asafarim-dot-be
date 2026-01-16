using System;
using Microsoft.AspNetCore.Identity;

namespace Identity.Api.Models;

public class AppUser : IdentityUser<Guid>
{
    /// <summary>
    /// Timestamp when the user was created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the user was last updated (UTC).
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional: User ID of who created the user account.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Optional: User ID of who last updated the user account.
    /// </summary>
    public string? UpdatedBy { get; set; }

    /// <summary>
    /// Soft delete flag. Set to true when user account is logically deleted.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Optional: Timestamp when the user was deleted (UTC).
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    /// <summary>
    /// Optional: User ID of who deleted the user account.
    /// </summary>
    public string? DeletedBy { get; set; }

    /// <summary>
    /// User's preferred language (ISO 639-1 code: en, nl)
    /// </summary>
    public string PreferredLanguage { get; set; } = "en";

    /// <summary>
    /// User's first name.
    /// </summary>
    public string FirstName { get; set; } = "";

    /// <summary>
    /// User's last name.
    /// </summary>
    public string LastName { get; set; } = "";
}
