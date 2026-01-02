using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Services.ContentSanitization;

namespace SmartPath.Api.Services;

public class TaskService : ITaskService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<TaskService> _logger;
    private readonly IHtmlContentSanitizer _sanitizer;

    public TaskService(
        SmartPathDbContext context,
        ILogger<TaskService> logger,
        IHtmlContentSanitizer sanitizer
    )
    {
        _context = context;
        _logger = logger;
        _sanitizer = sanitizer;
    }

    public async System.Threading.Tasks.Task<List<Entities.Task>> GetFamilyTasksAsync(
        int familyId,
        int? assignedToUserId = null,
        string? status = null
    )
    {
        var query = _context
            .Tasks.Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedBy)
            .Include(t => t.LastEditedBy)
            .Include(t => t.Comments)
            .Where(t => t.FamilyId == familyId);

        if (assignedToUserId.HasValue)
        {
            query = query.Where(t => t.AssignedToUserId == assignedToUserId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(t => t.Status == status);
        }

        return await query.OrderBy(t => t.DueDate).ToListAsync();
    }

    public async System.Threading.Tasks.Task<Entities.Task?> GetByIdAsync(int taskId)
    {
        return await _context
            .Tasks.Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedBy)
            .Include(t => t.LastEditedBy)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);
    }

    public async System.Threading.Tasks.Task<Entities.Task> CreateAsync(Entities.Task task)
    {
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        // Handle rich text fields
        if (!string.IsNullOrEmpty(task.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                task.DescriptionJson,
                task.DescriptionHtml,
                "DescriptionJson/Html"
            );
            task.DescriptionHtml = _sanitizer.SanitizeArticleHtml(task.DescriptionHtml);
        }

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async System.Threading.Tasks.Task<Entities.Task> UpdateAsync(
        Entities.Task task,
        int? editingUserId = null
    )
    {
        var existing = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == task.TaskId);
        if (existing == null)
            throw new InvalidOperationException("Task not found");

        existing.Title = task.Title;
        existing.Description = task.Description;
        existing.Category = task.Category;
        existing.Priority = task.Priority;
        existing.Status = task.Status;
        existing.DueDate = task.DueDate;
        existing.EstimatedMinutes = task.EstimatedMinutes;
        existing.IsRecurring = task.IsRecurring;
        existing.RecurrencePattern = task.RecurrencePattern;
        existing.CompletedAt = task.CompletedAt;
        existing.UpdatedAt = DateTime.UtcNow;

        if (editingUserId.HasValue)
        {
            existing.LastEditedAt = DateTime.UtcNow;
            existing.LastEditedByUserId = editingUserId.Value;
        }

        // Handle rich text fields - only update if rich text is provided
        _logger.LogInformation(
            "UpdateAsync - DescriptionHtml: {DescriptionHtml}, DescriptionJson: {DescriptionJson}, Description: {Description}",
            task.DescriptionHtml ?? "(null)",
            task.DescriptionJson ?? "(null)",
            task.Description ?? "(null)"
        );

        // Debug: Check the actual values
        _logger.LogInformation(
            "UpdateAsync DEBUG - DescriptionHtml length: {Length}, IsNullOrEmpty: {IsNullOrEmpty}",
            task.DescriptionHtml?.Length ?? 0,
            string.IsNullOrEmpty(task.DescriptionHtml)
        );

        if (!string.IsNullOrEmpty(task.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                task.DescriptionJson,
                task.DescriptionHtml,
                "DescriptionJson/Html"
            );
            existing.DescriptionJson = task.DescriptionJson;
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(task.DescriptionHtml);
            existing.Description = null; // Clear plain text when using rich text
            _logger.LogInformation(
                "UpdateAsync - Saved DescriptionHtml: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        else if (!string.IsNullOrEmpty(task.Description))
        {
            var html = $"<p>{System.Net.WebUtility.HtmlEncode(task.Description)}</p>";
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(html);
            existing.DescriptionJson = null;
            _logger.LogInformation(
                "UpdateAsync - Converted Description to HTML: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        // If neither rich text nor plain description provided, keep existing values
        // (don't log this as an error - it's valid to update other fields without description)

        _context.Tasks.Update(existing);
        await _context.SaveChangesAsync();

        return existing;
    }

    public async System.Threading.Tasks.Task<Entities.Task> AssignTaskAsync(
        int taskId,
        int? assignedToUserId,
        int assigningUserId
    )
    {
        var task = await GetByIdAsync(taskId);
        if (task == null)
            throw new KeyNotFoundException($"Task {taskId} not found");

        task.AssignedToUserId = assignedToUserId;
        task.AssignedByUserId = assigningUserId;
        task.AssignedAt = DateTime.UtcNow;
        task.LastEditedAt = DateTime.UtcNow;
        task.LastEditedByUserId = assigningUserId;
        task.UpdatedAt = DateTime.UtcNow;

        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Task {TaskId} assigned to user {AssignedToUserId} by {AssigningUserId}",
            taskId,
            assignedToUserId,
            assigningUserId
        );

        return task;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task != null)
        {
            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task<Entities.Task> CompleteTaskAsync(
        int taskId,
        int userId
    )
    {
        var task = await GetByIdAsync(taskId);
        if (task == null)
        {
            throw new KeyNotFoundException($"Task {taskId} not found");
        }

        task.Status = "Completed";
        task.CompletedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return task;
    }

    public async System.Threading.Tasks.Task DeleteBulkAsync(List<int> taskIds)
    {
        var tasks = await _context.Tasks.Where(t => taskIds.Contains(t.TaskId)).ToListAsync();

        _context.Tasks.RemoveRange(tasks);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task DeleteByFamilyAsync(int familyId)
    {
        var tasks = await _context.Tasks.Where(t => t.FamilyId == familyId).ToListAsync();

        _context.Tasks.RemoveRange(tasks);
        await _context.SaveChangesAsync();
    }
}
