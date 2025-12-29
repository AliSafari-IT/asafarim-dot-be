using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;

namespace SmartPath.Api.Services;

public class TaskService : ITaskService
{
    private readonly SmartPathDbContext _context;

    public TaskService(SmartPathDbContext context)
    {
        _context = context;
    }

    public async Task<List<Entities.Task>> GetFamilyTasksAsync(
        int familyId,
        int? assignedToUserId = null,
        string? status = null
    )
    {
        var query = _context
            .Tasks.Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
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

    public async Task<Entities.Task?> GetByIdAsync(int taskId)
    {
        return await _context
            .Tasks.Include(t => t.AssignedTo)
            .Include(t => t.CreatedBy)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.TaskId == taskId);
    }

    public async Task<Entities.Task> CreateAsync(Entities.Task task)
    {
        task.CreatedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return task;
    }

    public async System.Threading.Tasks.Task<Entities.Task> UpdateAsync(Entities.Task task)
    {
        task.UpdatedAt = DateTime.UtcNow;
        _context.Tasks.Update(task);
        await _context.SaveChangesAsync();

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

    public async System.Threading.Tasks.Task<Entities.Task> CompleteTaskAsync(int taskId, int userId)
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
        var tasks = await _context.Tasks
            .Where(t => taskIds.Contains(t.TaskId))
            .ToListAsync();

        _context.Tasks.RemoveRange(tasks);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task DeleteByFamilyAsync(int familyId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.FamilyId == familyId)
            .ToListAsync();

        _context.Tasks.RemoveRange(tasks);
        await _context.SaveChangesAsync();
    }
}
