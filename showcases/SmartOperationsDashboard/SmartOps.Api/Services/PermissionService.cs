using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using SmartOps.Api.Data;
using SmartOps.Api.DTOs;

namespace SmartOps.Api.Services;

/// <summary>
/// Permission service implementation - extracts user info from JWT and checks roles
/// </summary>
public class PermissionService : IPermissionService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly SmartOpsDbContext _dbContext;

    public PermissionService(IHttpContextAccessor httpContextAccessor, SmartOpsDbContext dbContext)
    {
        _httpContextAccessor = httpContextAccessor;
        _dbContext = dbContext;
    }

    public UserContextDto GetCurrentUser()
    {
        var user = _httpContextAccessor.HttpContext?.User;
        if (user == null)
            throw new UnauthorizedAccessException("User context not found");

        var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = user.FindFirst(ClaimTypes.Email)?.Value;
        var name = user.FindFirst(ClaimTypes.Name)?.Value;
        var role = user.FindFirst(ClaimTypes.Role)?.Value ?? "Member";

        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedAccessException("User ID not found in token");

        return new UserContextDto
        {
            UserId = Guid.Parse(userId),
            Email = email ?? string.Empty,
            Name = name,
            Role = role,
        };
    }

    public bool IsAdmin()
    {
        var role = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
        return role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
            || role?.Equals("admin", StringComparison.OrdinalIgnoreCase) == true;
    }

    public bool IsManager()
    {
        var role = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value;
        return role?.Equals("Manager", StringComparison.OrdinalIgnoreCase) == true
            || role?.Equals("manager", StringComparison.OrdinalIgnoreCase) == true
            || role?.Equals("Admin", StringComparison.OrdinalIgnoreCase) == true
            || role?.Equals("admin", StringComparison.OrdinalIgnoreCase) == true;
    }

    public bool CanManageDevices()
    {
        return IsManager();
    }

    public async Task<UserPermissionDto?> GetUserPermissionAsync(Guid userId)
    {
        var permission = await _dbContext
            .UserPermissions.Where(p => p.AppUserId == userId && p.IsActive)
            .FirstOrDefaultAsync();

        if (permission == null)
            return null;

        return new UserPermissionDto
        {
            Id = permission.Id,
            AppUserId = permission.AppUserId,
            Role = permission.Role.ToString(),
            IsActive = permission.IsActive,
            CreatedAt = permission.CreatedAt,
            UpdatedAt = permission.UpdatedAt,
        };
    }
}
