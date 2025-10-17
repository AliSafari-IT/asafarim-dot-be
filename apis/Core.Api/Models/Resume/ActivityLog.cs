namespace Core.Api.Models.Resume;

/// <summary>
/// Activity tracking for portfolio actions
/// </summary>
public class ActivityLog
{
    public Guid Id { get; set; }
    
    /// <summary>
    /// User who performed the action
    /// </summary>
    public string UserId { get; set; } = string.Empty;
    
    /// <summary>
    /// Type of entity (Project, Publication, Resume, etc.)
    /// </summary>
    public string EntityType { get; set; } = string.Empty;
    
    /// <summary>
    /// ID of the entity (stored as string for flexibility)
    /// </summary>
    public string EntityId { get; set; } = string.Empty;
    
    /// <summary>
    /// Action performed (Create, Update, Delete, Link, Unlink, Publish, Unpublish, View)
    /// </summary>
    public string Action { get; set; } = string.Empty;
    
    /// <summary>
    /// Optional details about the action (JSON format)
    /// </summary>
    public string? Details { get; set; }
    
    /// <summary>
    /// Entity name/title for display purposes
    /// </summary>
    public string? EntityName { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Enum-like constants for activity actions
/// </summary>
public static class ActivityAction
{
    public const string Create = "Create";
    public const string Update = "Update";
    public const string Delete = "Delete";
    public const string Link = "Link";
    public const string Unlink = "Unlink";
    public const string Publish = "Publish";
    public const string Unpublish = "Unpublish";
    public const string View = "View";
}

/// <summary>
/// Enum-like constants for entity types
/// </summary>
public static class EntityType
{
    public const string Project = "Project";
    public const string Publication = "Publication";
    public const string Resume = "Resume";
    public const string WorkExperience = "WorkExperience";
    public const string Portfolio = "Portfolio";
}
