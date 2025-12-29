using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public interface IFamilyService
{
    System.Threading.Tasks.Task<List<Family>> GetUserFamiliesAsync(int userId);
    System.Threading.Tasks.Task<Family?> GetByIdAsync(int familyId);
    System.Threading.Tasks.Task<Family> CreateAsync(string familyName, int createdByUserId);
    System.Threading.Tasks.Task<Family> UpdateAsync(Family family);
    System.Threading.Tasks.Task DeleteAsync(int familyId);
    System.Threading.Tasks.Task DeleteBulkAsync(List<int> familyIds);
    System.Threading.Tasks.Task<FamilyMember> AddMemberAsync(
        int familyId,
        int currentUserId,
        int userId,
        string? role = null,
        DateTime? dateOfBirth = null,
        bool isAdmin = false
    );
    System.Threading.Tasks.Task<FamilyMember> AddMemberByEmailAsync(
        int familyId,
        int currentUserId,
        string email,
        string? role = null,
        bool isAdmin = false
    );
    System.Threading.Tasks.Task RemoveMemberAsync(
        int familyId,
        int currentUserId,
        int targetUserId,
        bool isAdmin = false
    );
    System.Threading.Tasks.Task<bool> IsMemberAsync(int familyId, int userId);
    System.Threading.Tasks.Task<string?> GetUserRoleAsync(int familyId, int userId);
    System.Threading.Tasks.Task<bool> CanManageMembersAsync(
        int familyId,
        int currentUserId,
        bool isAdmin
    );
    System.Threading.Tasks.Task<bool> CanRemoveMemberAsync(
        int familyId,
        int currentUserId,
        int targetUserId,
        bool isAdmin
    );
}