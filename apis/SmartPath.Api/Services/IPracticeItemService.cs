using System.Threading.Tasks;
using SmartPath.Api.DTOs;

namespace SmartPath.Api.Services;

public interface IPracticeItemService
{
    System.Threading.Tasks.Task<List<PracticeItemDto>> GetItemsByLessonAsync(int lessonId);
    System.Threading.Tasks.Task<PracticeItemDto> CreateItemAsync(
        CreatePracticeItemDto dto,
        int userId
    );
    System.Threading.Tasks.Task<PracticeItemDto> UpdateItemAsync(
        int itemId,
        UpdatePracticeItemDto dto,
        int userId
    );
    System.Threading.Tasks.Task DeleteItemAsync(int itemId, int userId);
    System.Threading.Tasks.Task<PracticeItemDto> GetNextItemAsync(int sessionId, int userId);
    System.Threading.Tasks.Task<PracticeDashboardDto> GetFamilyDashboardAsync(
        int familyId,
        int userId
    );
}
