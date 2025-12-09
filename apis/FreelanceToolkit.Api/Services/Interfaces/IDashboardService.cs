using FreelanceToolkit.Api.DTOs.Dashboard;

namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync(string userId);
}
