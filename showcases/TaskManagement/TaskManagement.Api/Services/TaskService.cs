using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public class TaskService : ITaskService
{
    private readonly TaskManagementDbContext _context;
    private readonly IPermissionService _permissionService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, (string Name, string Email)> _userCache = new();

    public TaskService(
        TaskManagementDbContext context,
        IPermissionService permissionService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration
    )
    {
        _context = context;
        _permissionService = permissionService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<TaskDto?> GetTaskByIdAsync(Guid taskId)
    {
        var task = await _context
            .Tasks.Include(t => t.Assignments)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        return task == null ? null : await MapToDtoAsync(task);
    }

    public async Task<List<TaskDto>> GetProjectTasksAsync(Guid projectId, TaskFilterDto filter)
    {
        var query = _context
            .Tasks.Where(t => t.ProjectId == projectId)
            .Include(t => t.Assignments)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .AsQueryable();

        // Apply filters
        if (filter.Status.HasValue)
            query = query.Where(t => t.Status == filter.Status);

        if (filter.Priority.HasValue)
            query = query.Where(t => t.Priority == filter.Priority);

        if (!string.IsNullOrEmpty(filter.SearchTerm))
            query = query.Where(t =>
                t.Title.Contains(filter.SearchTerm) || t.Description!.Contains(filter.SearchTerm)
            );

        if (filter.DueDateFrom.HasValue)
            query = query.Where(t => t.DueDate >= filter.DueDateFrom);

        if (filter.DueDateTo.HasValue)
            query = query.Where(t => t.DueDate <= filter.DueDateTo);

        if (!string.IsNullOrEmpty(filter.AssignedUserId))
            query = query.Where(t => t.Assignments.Any(a => a.UserId == filter.AssignedUserId));

        // Apply sorting
        query = filter.SortBy.ToLower() switch
        {
            "duedate" => filter.Descending
                ? query.OrderByDescending(t => t.DueDate)
                : query.OrderBy(t => t.DueDate),
            "priority" => filter.Descending
                ? query.OrderByDescending(t => t.Priority)
                : query.OrderBy(t => t.Priority),
            "status" => filter.Descending
                ? query.OrderByDescending(t => t.Status)
                : query.OrderBy(t => t.Status),
            _ => filter.Descending
                ? query.OrderByDescending(t => t.CreatedAt)
                : query.OrderBy(t => t.CreatedAt),
        };

        var tasks = await query.Skip(filter.Skip).Take(filter.Take).ToListAsync();

        var dtos = new List<TaskDto>();
        foreach (var task in tasks)
        {
            dtos.Add(await MapToDtoAsync(task));
        }
        return dtos;
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, string userId)
    {
        // Verify project exists
        var project = await _context.Projects.FindAsync(dto.ProjectId);
        if (project == null)
            throw new KeyNotFoundException($"Project with ID {dto.ProjectId} not found");

        // Verify project access
        if (!await _permissionService.CanAccessProjectAsync(dto.ProjectId, userId))
            throw new UnauthorizedAccessException("You don't have access to this project");

        // Only project owner or members can create tasks (not just any public project viewer)
        var isOwner = project.UserId == userId;
        var isMember = await _context.ProjectMembers.AnyAsync(m =>
            m.ProjectId == dto.ProjectId && m.UserId == userId
        );

        if (!isOwner && !isMember)
            throw new UnauthorizedAccessException("Only project members can create tasks");

        // Ensure DueDate is UTC if provided
        DateTime? dueDate = null;
        if (dto.DueDate.HasValue)
        {
            dueDate = DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);
        }

        var task = new TaskManagement.Api.Models.TaskManagement
        {
            Id = Guid.NewGuid(),
            ProjectId = dto.ProjectId,
            Title = dto.Title,
            Description = dto.Description,
            Status = dto.Status,
            Priority = dto.Priority,
            DueDate = dueDate,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // Add assignments
        if (dto.AssignedUserIds != null && dto.AssignedUserIds.Count > 0)
        {
            foreach (var assignedUserId in dto.AssignedUserIds)
            {
                task.Assignments.Add(
                    new TaskAssignment
                    {
                        Id = Guid.NewGuid(),
                        UserId = assignedUserId,
                        AssignedAt = DateTime.UtcNow,
                    }
                );
            }
        }

        _context.Tasks.Add(task);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException dbEx)
        {
            Console.WriteLine($"DEBUG: DbUpdateException: {dbEx.Message}");
            if (dbEx.InnerException != null)
            {
                Console.WriteLine($"DEBUG: Inner exception: {dbEx.InnerException.Message}");
                Console.WriteLine($"DEBUG: Inner stack: {dbEx.InnerException.StackTrace}");
            }
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: General exception: {ex.GetType().Name}: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"DEBUG: Inner exception: {ex.InnerException.Message}");
            throw;
        }

        return await MapToDtoAsync(task);
    }

    public async Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, string userId)
    {
        var task = await _context
            .Tasks.Include(t => t.Assignments)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        if (!await _permissionService.CanEditTaskAsync(taskId, userId))
            throw new UnauthorizedAccessException("You don't have permission to edit this task");

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        // Ensure DueDate is UTC if provided
        if (dto.DueDate.HasValue)
        {
            task.DueDate = DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc);
        }
        else
        {
            task.DueDate = null;
        }
        task.UpdatedAt = DateTime.UtcNow;

        // Update assignments - remove old ones from database first
        var existingAssignments = await _context
            .TaskAssignments.Where(a => a.TaskId == taskId)
            .ToListAsync();
        _context.TaskAssignments.RemoveRange(existingAssignments);

        // Add new assignments
        if (dto.AssignedUserIds != null && dto.AssignedUserIds.Count > 0)
        {
            foreach (var assignedUserId in dto.AssignedUserIds)
            {
                _context.TaskAssignments.Add(
                    new TaskAssignment
                    {
                        Id = Guid.NewGuid(),
                        TaskId = taskId,
                        UserId = assignedUserId,
                        AssignedAt = DateTime.UtcNow,
                    }
                );
            }
        }

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(task);
    }

    public async Task DeleteTaskAsync(Guid taskId, string userId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
            throw new KeyNotFoundException("Task not found");

        if (!await _permissionService.CanDeleteTaskAsync(taskId, userId))
            throw new UnauthorizedAccessException("You don't have permission to delete this task");

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
    }

    public async Task<TaskDto> UpdateTaskStatusAsync(
        Guid taskId,
        Models.WorkTaskStatus status,
        string userId
    )
    {
        var task = await _context
            .Tasks.Include(t => t.Assignments)
            .Include(t => t.Comments)
            .Include(t => t.Attachments)
            .FirstOrDefaultAsync(t => t.Id == taskId);

        if (task == null)
            throw new KeyNotFoundException("Task not found");

        if (!await _permissionService.CanEditTaskAsync(taskId, userId))
            throw new UnauthorizedAccessException("You don't have permission to update this task");

        task.Status = status;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await MapToDtoAsync(task);
    }

    private async Task<TaskDto> MapToDtoAsync(TaskManagement.Api.Models.TaskManagement task)
    {
        var assignments = new List<TaskAssignmentDto>();

        foreach (var assignment in task.Assignments)
        {
            var (userName, userEmail) = await GetUserInfoAsync(assignment.UserId);
            assignments.Add(
                new TaskAssignmentDto
                {
                    Id = assignment.Id,
                    UserId = assignment.UserId,
                    UserName = userName,
                    UserEmail = userEmail,
                    AssignedAt = assignment.AssignedAt,
                }
            );
        }

        return new TaskDto
        {
            Id = task.Id,
            ProjectId = task.ProjectId,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CreatedBy = task.CreatedBy,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            Assignments = assignments,
            CommentCount = task.Comments.Count,
            AttachmentCount = task.Attachments.Count,
        };
    }

    private async Task<(string Name, string Email)> GetUserInfoAsync(string userId)
    {
        // Check cache first
        if (_userCache.TryGetValue(userId, out var cached))
            return cached;

        try
        {
            var identityApiUrl = _configuration["IdentityApiUrl"];
            if (string.IsNullOrEmpty(identityApiUrl))
                return (userId, "");

            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync($"{identityApiUrl}/users/{userId}");

            if (!response.IsSuccessStatusCode)
            {
                // Cache the failed lookup to avoid repeated requests
                _userCache[userId] = (userId, "");
                return (userId, "");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var root = doc.RootElement;

            var name = root.GetProperty("userName").GetString() ?? userId;
            var email = root.TryGetProperty("email", out var emailProp)
                ? emailProp.GetString() ?? ""
                : "";

            var result = (name, email);
            _userCache[userId] = result;
            return result;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DEBUG: Failed to fetch user info for {userId}: {ex.Message}");
            _userCache[userId] = (userId, "");
            return (userId, "");
        }
    }
}
