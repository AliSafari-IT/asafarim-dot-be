using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class PermissionService : IPermissionService
{
    private readonly TaskManagementDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PermissionService(
        TaskManagementDbContext context,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
    }

    private bool IsGlobalAdmin()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        var roles = user?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();
        var isAdmin = roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase));
        
        Console.WriteLine($"DEBUG: IsGlobalAdmin check - Roles: [{string.Join(", ", roles)}], Result: {isAdmin}");
        
        return isAdmin;
    }

    public async Task<bool> CanAccessProjectAsync(Guid projectId, string userId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        // Global admins can access any project
        if (IsGlobalAdmin())
            return true;

        // Owner can always access
        if (project.UserId == userId)
            return true;

        // If private, only members can access
        if (project.IsPrivate)
        {
            return await _context.ProjectMembers.AnyAsync(m =>
                m.ProjectId == projectId && m.UserId == userId
            );
        }

        // Public projects are accessible to everyone
        return true;
    }

    public async Task<bool> CanManageProjectAsync(Guid projectId, string userId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        // Global admins can manage any project
        if (IsGlobalAdmin())
            return true;

        // Owner can always manage
        if (project.UserId == userId)
            return true;

        // Check if user is admin member
        var member = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == projectId && m.UserId == userId
        );

        return member?.Role == ProjectRole.Admin;
    }

    public async Task<bool> CanEditTaskAsync(Guid taskId, string userId)
    {
        var task = await _context
            .Tasks.Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            return false;

        // Project owner can edit
        if (task.Project?.UserId == userId)
            return true;

        // Project admin/manager can edit
        var member = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == task.ProjectId && m.UserId == userId
        );

        if (member?.Role == ProjectRole.Admin || member?.Role == ProjectRole.Manager)
            return true;

        // Task creator can edit
        return task.CreatedBy == userId;
    }

    public async Task<bool> CanDeleteTaskAsync(Guid taskId, string userId)
    {
        var task = await _context
            .Tasks.Include(t => t.Project)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            return false;

        // Only project owner and admins can delete
        if (task.Project?.UserId == userId)
            return true;

        var member = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == task.ProjectId && m.UserId == userId
        );

        return member?.Role == ProjectRole.Admin;
    }

    public async Task<bool> CanManageProjectMembersAsync(Guid projectId, string userId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return false;

        // Owner can manage members
        if (project.UserId == userId)
            return true;

        // Check if user is admin member
        var member = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == projectId && m.UserId == userId
        );

        return member?.Role == ProjectRole.Admin;
    }

    public ProjectRole GetUserProjectRole(TaskProject project, string userId)
    {
        if (project.UserId == userId)
            return ProjectRole.Admin;

        var member = _context.ProjectMembers.FirstOrDefault(m =>
            m.ProjectId == project.Id && m.UserId == userId
        );

        return member?.Role ?? ProjectRole.Member;
    }
}
