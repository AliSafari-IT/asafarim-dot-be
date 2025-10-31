namespace SmartOps.Api.DTOs;

/// <summary>
/// User context from JWT claims (read-only)
/// </summary>
public class UserContextDto
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string Role { get; set; } = "Member";
}

/// <summary>
/// User permission data transfer object
/// </summary>
public class UserPermissionDto
{
    public Guid Id { get; set; }
    public Guid AppUserId { get; set; }
    public string Role { get; set; } = "Member";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Create user permission request DTO (Admin only)
/// </summary>
public class CreateUserPermissionDto
{
    public Guid AppUserId { get; set; }
    public string Role { get; set; } = "Member";
    public bool? IsActive { get; set; }
}

/// <summary>
/// Update user permission request DTO (Admin only)
/// </summary>
public class UpdateUserPermissionDto
{
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}
