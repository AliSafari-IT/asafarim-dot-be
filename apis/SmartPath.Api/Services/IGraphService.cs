using SmartPath.Api.DTOs;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public interface IGraphService
{
    System.Threading.Tasks.Task<List<Graph>> GetAllGraphsAsync();
    System.Threading.Tasks.Task<List<Graph>> GetAllGraphsAsync(int userId);
    System.Threading.Tasks.Task<Graph?> GetGraphByIdAsync(int id);
    System.Threading.Tasks.Task<Graph?> GetGraphByIdAsync(int id, int userId);
    System.Threading.Tasks.Task<Graph> CreateGraphAsync(CreateGraphDto dto, int userId);
    System.Threading.Tasks.Task<Graph> UpdateGraphAsync(int id, UpdateGraphDto dto, int userId);
    System.Threading.Tasks.Task DeleteGraphAsync(int id, int userId);
}
