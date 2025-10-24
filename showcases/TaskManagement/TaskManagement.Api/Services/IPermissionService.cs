using TaskManagement.Api.Models;

namespace TaskManagement.Api.Services;

public interface IPermissionService
{
    Task<bool> CanAccessProjectAsync(Guid projectId, string userId);
    Task<bool> CanManageProjectAsync(Guid projectId, string userId);
    Task<bool> CanEditTaskAsync(Guid taskId, string userId);
    Task<bool> CanDeleteTaskAsync(Guid taskId, string userId);
    Task<bool> CanManageProjectMembersAsync(Guid projectId, string userId);
    ProjectRole GetUserProjectRole(TaskProject project, string userId);
}
