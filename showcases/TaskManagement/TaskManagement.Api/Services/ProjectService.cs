using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class ProjectService : IProjectService
{
    private readonly TaskManagementDbContext _context;
    private readonly IPermissionService _permissionService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProjectService(
        TaskManagementDbContext context,
        IPermissionService permissionService,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _permissionService = permissionService;
        _httpContextAccessor = httpContextAccessor;
    }

    private bool IsGlobalAdmin()
    {
        var user = _httpContextAccessor?.HttpContext?.User;
        var roles = user?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();
        return roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase));
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid projectId)
    {
        var project = await _context
            .Projects.Include(p => p.Tasks)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        return project == null ? null : MapToDto(project);
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(string userId)
    {
        try
        {
            Console.WriteLine($"DEBUG: GetUserProjectsAsync called with userId: {userId}");

            var projects = await _context
                .Projects.Where(p => p.UserId == userId)
                .Include(p => p.Tasks)
                .Include(p => p.Members)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            Console.WriteLine($"DEBUG: Found {projects.Count} projects in database for user {userId}");

            var result = projects.Select(MapToDto).ToList();
            Console.WriteLine($"DEBUG: Mapped {result.Count} projects to DTOs");

            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: Error in GetUserProjectsAsync: {ex.Message}");
            Console.WriteLine($"DEBUG: Stack trace: {ex.StackTrace}");
            throw; // Re-throw to propagate the error
        }
    }

    public async Task<List<ProjectDto>> GetSharedProjectsAsync(string userId)
    {
        try
        {
            Console.WriteLine($"DEBUG: GetSharedProjectsAsync called with userId: {userId}");
            
            IQueryable<TaskProject> query;

            if (IsGlobalAdmin())
            {
                // Global admins see all projects
                Console.WriteLine("DEBUG: User is global admin, showing all projects");
                query = _context.Projects;
            }
            else
            {
                // Regular users see public projects and projects they're members of
                Console.WriteLine($"DEBUG: User is not admin, filtering projects");
                query = _context.Projects.Where(p =>
                    p.UserId != userId && (!p.IsPrivate || p.Members.Any(m => m.UserId == userId))
                );
            }

            var projects = await query
                .Include(p => p.Tasks)
                .Include(p => p.Members)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            Console.WriteLine($"DEBUG: Found {projects.Count} shared projects for user {userId}");
            return projects.Select(MapToDto).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in GetSharedProjectsAsync: {ex.Message}");
            Console.WriteLine($"ERROR Stack: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<List<ProjectDto>> GetPublicProjectsAsync()
    {
        try
        {
            Console.WriteLine("DEBUG: GetPublicProjectsAsync called");
            
            // Temporary workaround: Get all projects and filter in memory
            // This bypasses the EF Core IsPrivate column query issue
            var allProjects = await _context.Projects.ToListAsync();
            Console.WriteLine($"DEBUG: Got {allProjects.Count} total projects from database");
            
            // Filter to public projects in memory
            var publicProjects = allProjects
                .Where(p => !p.IsPrivate)
                .ToList();
            
            Console.WriteLine($"DEBUG: Filtered to {publicProjects.Count} public projects");
            
            return publicProjects.Select(MapToDto).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ERROR in GetPublicProjectsAsync: {ex.Message}");
            Console.WriteLine($"ERROR Stack: {ex.StackTrace}");
            throw;
        }
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, string userId)
    {
        var project = new TaskProject
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            UserId = userId,
            IsPrivate = dto.IsPrivate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return MapToDto(project);
    }

    public async Task<ProjectDto> UpdateProjectAsync(
        Guid projectId,
        UpdateProjectDto dto,
        string userId
    )
    {
        var project = await _context
            .Projects.Include(p => p.Tasks)
            .Include(p => p.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            throw new KeyNotFoundException("Project not found");

        // Check if user can manage the project (owner or admin member)
        var canManage = await _permissionService.CanManageProjectAsync(projectId, userId);
        if (!canManage)
            throw new UnauthorizedAccessException(
                "You don't have permission to update this project"
            );

        project.Name = dto.Name;
        project.Description = dto.Description;
        project.IsPrivate = dto.IsPrivate;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(project);
    }

    public async Task DeleteProjectAsync(Guid projectId, string userId)
    {
        var project = await _context
            .Projects.Include(p => p.Tasks)
            .FirstOrDefaultAsync(p => p.Id == projectId);
        
        if (project == null)
            throw new KeyNotFoundException("Project not found");

        // Check if user can manage the project (owner or admin member)
        var canManage = await _permissionService.CanManageProjectAsync(projectId, userId);
        if (!canManage)
            throw new UnauthorizedAccessException(
                "You don't have permission to delete this project"
            );

        // Delete all related task comments first
        var taskIds = project.Tasks.Select(t => t.Id).ToList();
        if (taskIds.Count > 0)
        {
            var comments = await _context.TaskComments
                .Where(c => taskIds.Contains(c.TaskId))
                .ToListAsync();
            _context.TaskComments.RemoveRange(comments);

            // Delete all task assignments
            var assignments = await _context.TaskAssignments
                .Where(a => taskIds.Contains(a.TaskId))
                .ToListAsync();
            _context.TaskAssignments.RemoveRange(assignments);

            // Delete all task attachments
            var attachments = await _context.TaskAttachments
                .Where(a => taskIds.Contains(a.TaskId))
                .ToListAsync();
            _context.TaskAttachments.RemoveRange(attachments);
        }

        // Delete all tasks
        _context.Tasks.RemoveRange(project.Tasks);

        // Delete all project members
        var members = await _context.ProjectMembers
            .Where(m => m.ProjectId == projectId)
            .ToListAsync();
        _context.ProjectMembers.RemoveRange(members);

        // Delete the project
        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
    }

    private ProjectDto MapToDto(TaskProject project)
    {
        return new ProjectDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            UserId = project.UserId,
            IsPrivate = project.IsPrivate,
            CreatedAt = project.CreatedAt,
            UpdatedAt = project.UpdatedAt,
            TaskCount = project.Tasks.Count,
            MemberCount = project.Members.Count,
        };
    }
}
