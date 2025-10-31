using SmartOps.Api.DTOs;

namespace SmartOps.Api.Services;

/// <summary>
/// Permission service for role-based access control
/// </summary>
public interface IPermissionService
{
    /// <summary>
    /// Get current user context from JWT claims
    /// </summary>
    UserContextDto GetCurrentUser();
    
    /// <summary>
    /// Check if user has admin role
    /// </summary>
    bool IsAdmin();
    
    /// <summary>
    /// Check if user has manager role or higher
    /// </summary>
    bool IsManager();
    
    /// <summary>
    /// Check if user can manage devices (Manager or Admin)
    /// </summary>
    bool CanManageDevices();
    
    /// <summary>
    /// Get user permission record from database
    /// </summary>
    Task<UserPermissionDto?> GetUserPermissionAsync(Guid userId);
}
