using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TaskManagement.Api.DTOs;

namespace TaskManagement.Api.Services;

public interface ITaskService
{
    Task<TaskDto?> GetTaskByIdAsync(Guid taskId);
    Task<List<TaskDto>> GetProjectTasksAsync(Guid projectId, TaskFilterDto filter);
    Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, string userId);
    Task<TaskDto> UpdateTaskAsync(Guid taskId, UpdateTaskDto dto, string userId);
    Task DeleteTaskAsync(Guid taskId, string userId);
    Task<TaskDto> UpdateTaskStatusAsync(Guid taskId, Models.WorkTaskStatus status, string userId);
}
