using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SmartPath.Api.DTOs;

namespace SmartPath.Api.Services;

public interface IPracticeService
{
    System.Threading.Tasks.Task<PracticeSessionResponseDto> CreateSessionAsync(
        CreatePracticeSessionRequestDto dto,
        int userId
    );
    System.Threading.Tasks.Task<PracticeSessionResponseDto> CompleteSessionAsync(
        int sessionId,
        int userId
    );
    System.Threading.Tasks.Task<PracticeAttemptResponseDto> SubmitAttemptAsync(
        CreatePracticeAttemptRequestDto dto,
        int userId
    );
    System.Threading.Tasks.Task<PracticeItemDto> GetNextItemAsync(int sessionId, int userId);
    System.Threading.Tasks.Task<ChildPracticeSummaryDto> GetChildSummaryAsync(
        int childId,
        int userId
    );
    System.Threading.Tasks.Task<FamilyChildrenSummaryDto> GetFamilyChildrenSummaryAsync(
        int familyId,
        int userId
    );
    System.Threading.Tasks.Task<List<UserAchievementDto>> GetChildAchievementsAsync(
        int childId,
        int userId
    );
    System.Threading.Tasks.Task<List<AchievementDto>> GetAvailableAchievementsAsync();
    System.Threading.Tasks.Task<PracticeSessionReviewDto> GetSessionReviewAsync(
        int sessionId,
        int userId
    );
}
