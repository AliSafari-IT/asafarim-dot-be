using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOps.Api.Data;
using SmartOps.Api.DTOs;
using SmartOps.Api.Models;

namespace SmartOps.Api.Controllers;

/// <summary>
/// Admin API controller - User permission management
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly SmartOpsDbContext _dbContext;
    private readonly ILogger<AdminController> _logger;

    public AdminController(SmartOpsDbContext dbContext, ILogger<AdminController> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <summary>
    /// Get all user permissions
    /// </summary>
    [HttpGet("users")]
    public async Task<ActionResult<object>> GetAllUsers()
    {
        try
        {
            var users = await _dbContext.UserPermissions.OrderBy(u => u.CreatedAt).ToListAsync();

            var result = users.Select(u => new
            {
                u.Id,
                u.AppUserId,
                u.Role,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt,
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting users");
            return StatusCode(500, new { error = "Failed to retrieve users" });
        }
    }

    /// <summary>
    /// Get user permission by ID
    /// </summary>
    [HttpGet("users/{userId:guid}")]
    public async Task<ActionResult<object>> GetUser(Guid userId)
    {
        try
        {
            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            return Ok(
                new
                {
                    user.Id,
                    user.AppUserId,
                    user.Role,
                    user.IsActive,
                    user.CreatedAt,
                    user.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", userId);
            return StatusCode(500, new { error = "Failed to retrieve user" });
        }
    }

    /// <summary>
    /// Create or update user permission
    /// </summary>
    [HttpPost("users")]
    public async Task<ActionResult<object>> CreateOrUpdateUserPermission(
        [FromBody] CreateUserPermissionDto dto
    )
    {
        try
        {
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(
                    new { error = "Invalid role. Must be Member, Manager, or Admin" }
                );

            var existing = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == dto.AppUserId
            );

            if (existing != null)
            {
                existing.Role = role;
                existing.IsActive = dto.IsActive ?? true;
                existing.UpdatedAt = DateTime.UtcNow;
                _dbContext.UserPermissions.Update(existing);
            }
            else
            {
                var userPermission = new UserPermission
                {
                    Id = Guid.NewGuid(),
                    AppUserId = dto.AppUserId,
                    Role = role,
                    IsActive = dto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };
                _dbContext.UserPermissions.Add(userPermission);
            }

            await _dbContext.SaveChangesAsync();

            var result =
                existing
                ?? new UserPermission
                {
                    Id = Guid.NewGuid(),
                    AppUserId = dto.AppUserId,
                    Role = role,
                    IsActive = dto.IsActive ?? true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                };

            return Ok(
                new
                {
                    result.Id,
                    result.AppUserId,
                    Role = result.Role.ToString(),
                    result.IsActive,
                    result.CreatedAt,
                    result.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating/updating user permission");
            return StatusCode(500, new { error = "Failed to create/update user permission" });
        }
    }

    /// <summary>
    /// Update user permission
    /// </summary>
    [HttpPut("users/{userId:guid}")]
    public async Task<ActionResult<object>> UpdateUserPermission(
        Guid userId,
        [FromBody] UpdateUserPermissionDto dto
    )
    {
        try
        {
            if (!Enum.TryParse<UserRole>(dto.Role, true, out var role))
                return BadRequest(
                    new { error = "Invalid role. Must be Member, Manager, or Admin" }
                );

            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            user.Role = role;
            user.IsActive = dto.IsActive ?? user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            _dbContext.UserPermissions.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok(
                new
                {
                    user.Id,
                    user.AppUserId,
                    Role = user.Role.ToString(),
                    user.IsActive,
                    user.CreatedAt,
                    user.UpdatedAt,
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user permission {UserId}", userId);
            return StatusCode(500, new { error = "Failed to update user permission" });
        }
    }

    /// <summary>
    /// Delete user permission
    /// </summary>
    [HttpDelete("users/{userId:guid}")]
    public async Task<IActionResult> DeleteUserPermission(Guid userId)
    {
        try
        {
            var user = await _dbContext.UserPermissions.FirstOrDefaultAsync(u =>
                u.AppUserId == userId
            );

            if (user == null)
                return NotFound(new { error = "User not found" });

            _dbContext.UserPermissions.Remove(user);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user permission {UserId}", userId);
            return StatusCode(500, new { error = "Failed to delete user permission" });
        }
    }
}
