using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public interface ITaskService
{
    System.Threading.Tasks.Task<List<Entities.Task>> GetFamilyTasksAsync(
        int familyId,
        int? assignedToUserId = null,
        string? status = null
    );
    System.Threading.Tasks.Task<Entities.Task?> GetByIdAsync(int taskId);
    System.Threading.Tasks.Task<Entities.Task> CreateAsync(Entities.Task task);
    System.Threading.Tasks.Task<Entities.Task> UpdateAsync(Entities.Task task, int? editingUserId = null);
    System.Threading.Tasks.Task<Entities.Task> AssignTaskAsync(int taskId, int? assignedToUserId, int assigningUserId);
    System.Threading.Tasks.Task DeleteAsync(int taskId);
    System.Threading.Tasks.Task DeleteBulkAsync(List<int> taskIds);
    System.Threading.Tasks.Task DeleteByFamilyAsync(int familyId);
    System.Threading.Tasks.Task<Entities.Task> CompleteTaskAsync(int taskId, int userId);
}
