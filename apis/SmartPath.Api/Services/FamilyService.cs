using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class FamilyService : IFamilyService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<FamilyService> _logger;
    private readonly IUserService _userService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public FamilyService(
        SmartPathDbContext context,
        ILogger<FamilyService> logger,
        IUserService userService,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _context = context;
        _logger = logger;
        _userService = userService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<List<Family>> GetUserFamiliesAsync(int userId)
    {
        return await _context
            .FamilyMembers.Where(fm => fm.UserId == userId)
            .Include(fm => fm.Family)
            .ThenInclude(f => f.Members)
            .ThenInclude(m => m.User)
            .Select(fm => fm.Family!)
            .ToListAsync();
    }

    public async Task<Family?> GetByIdAsync(int familyId)
    {
        return await _context
            .Families.Include(f => f.Members)
            .ThenInclude(m => m.User)
            .Include(f => f.CreatedBy)
            .FirstOrDefaultAsync(f => f.FamilyId == familyId);
    }

    public async Task<Family> CreateAsync(string familyName, int createdByUserId)
    {
        var family = new Family
        {
            FamilyName = familyName,
            CreatedByUserId = createdByUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Families.Add(family);
        await _context.SaveChangesAsync();

        var familyMember = new FamilyMember
        {
            FamilyId = family.FamilyId,
            UserId = createdByUserId,
            Role = "familyManager",
            JoinedAt = DateTime.UtcNow,
        };

        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Family {FamilyId} created by user {UserId}",
            family.FamilyId,
            createdByUserId
        );

        return family;
    }

    public async Task<FamilyMember> AddMemberAsync(
        int familyId,
        int currentUserId,
        int userId,
        string? role = null,
        DateTime? dateOfBirth = null,
        bool isAdmin = false
    )
    {
        var canManage = await CanManageMembersAsync(familyId, currentUserId, isAdmin);
        if (!canManage)
            throw new UnauthorizedAccessException("Only familyManager or admin can add members");

        var assignedRole = string.IsNullOrWhiteSpace(role) ? "familyMember" : role.Trim();
        var validRoles = new[] { "familyManager", "familyMember" };
        if (!validRoles.Contains(assignedRole))
            throw new ArgumentException($"Invalid role: {assignedRole}");

        if (!isAdmin && assignedRole == "familyManager")
            throw new UnauthorizedAccessException("Only admin can assign familyManager role");

        var existingMember = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );

        if (existingMember != null)
            throw new InvalidOperationException("User is already a member of this family");

        var familyMember = new FamilyMember
        {
            FamilyId = familyId,
            UserId = userId,
            Role = assignedRole,
            DateOfBirth = dateOfBirth,
            JoinedAt = DateTime.UtcNow,
        };

        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} added to family {FamilyId} by {CurrentUserId} as {Role} (isAdmin={IsAdmin})",
            userId,
            familyId,
            currentUserId,
            assignedRole,
            isAdmin
        );

        return familyMember;
    }

    public async Task<FamilyMember> AddMemberByEmailAsync(
        int familyId,
        int currentUserId,
        string email,
        string? role = null,
        bool isAdmin = false
    )
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var assignedRole = string.IsNullOrWhiteSpace(role) ? "familyMember" : role.Trim();
        var validRoles = new[] { "familyManager", "familyMember" };
        if (!validRoles.Contains(assignedRole))
            throw new ArgumentException($"Invalid role: {assignedRole}");

        if (!isAdmin && assignedRole == "familyManager")
            throw new UnauthorizedAccessException("Only admin can assign familyManager role");

        var canManage = await CanManageMembersAsync(familyId, currentUserId, isAdmin);
        if (!canManage)
            throw new UnauthorizedAccessException("Only familyManager or admin can add members");

        var user = await GetOrSyncUserByEmailAsync(normalizedEmail);
        if (user == null)
            throw new KeyNotFoundException($"User with email {email} not found");

        var existingMember = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == user.UserId
        );

        if (existingMember != null)
            throw new InvalidOperationException("User is already a member of this family");

        var familyMember = new FamilyMember
        {
            FamilyId = familyId,
            UserId = user.UserId,
            Role = assignedRole,
            JoinedAt = DateTime.UtcNow,
        };

        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {UserId} added to family {FamilyId} by {CurrentUserId} via email as {Role} (isAdmin={IsAdmin})",
            user.UserId,
            familyId,
            currentUserId,
            assignedRole,
            isAdmin
        );

        return familyMember;
    }

    public async System.Threading.Tasks.Task RemoveMemberAsync(
        int familyId,
        int currentUserId,
        int targetUserId,
        bool isAdmin = false
    )
    {
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == targetUserId
        );

        if (member == null)
            throw new KeyNotFoundException("Member not found");

        var canRemove = await CanRemoveMemberAsync(familyId, currentUserId, targetUserId, isAdmin);
        if (!canRemove)
            throw new UnauthorizedAccessException("Not allowed to remove this member");

        _context.FamilyMembers.Remove(member);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "User {TargetUserId} removed from family {FamilyId} by user {CurrentUserId}",
            targetUserId,
            familyId,
            currentUserId
        );
    }

    public async System.Threading.Tasks.Task<bool> IsMemberAsync(int familyId, int userId)
    {
        return await _context.FamilyMembers.AnyAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );
    }

    public async System.Threading.Tasks.Task<string?> GetUserRoleAsync(int familyId, int userId)
    {
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );

        return member?.Role;
    }

    public async System.Threading.Tasks.Task<bool> CanManageMembersAsync(
        int familyId,
        int currentUserId,
        bool isAdmin
    )
    {
        if (isAdmin)
            return true;
        var role = await GetUserRoleAsync(familyId, currentUserId);
        return role == "familyManager";
    }

    public async System.Threading.Tasks.Task<bool> CanRemoveMemberAsync(
        int familyId,
        int currentUserId,
        int targetUserId,
        bool isAdmin
    )
    {
        if (isAdmin)
            return true;

        var currentUserRole = await GetUserRoleAsync(familyId, currentUserId);
        if (currentUserRole != "familyManager")
            return false;

        var targetMember = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == targetUserId
        );

        if (targetMember == null)
            return false;
        return targetMember.Role == "familyMember";
    }

    public async System.Threading.Tasks.Task<FamilyMember> UpdateMemberRoleAsync(
        int familyId,
        int familyMemberId,
        int currentUserId,
        string newRole,
        bool isAdmin = false
    )
    {
        var canManage = await CanManageMembersAsync(familyId, currentUserId, isAdmin);
        if (!canManage)
            throw new UnauthorizedAccessException(
                "Only familyManager or admin can update member roles"
            );

        var validRoles = new[] { "familyManager", "familyMember" };
        if (!validRoles.Contains(newRole))
            throw new ArgumentException($"Invalid role: {newRole}");

        if (!isAdmin && newRole == "familyManager")
            throw new UnauthorizedAccessException("Only admin can assign familyManager role");

        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyMemberId == familyMemberId && fm.FamilyId == familyId
        );

        if (member == null)
            throw new KeyNotFoundException("Member not found");

        var oldRole = member.Role;
        member.Role = newRole;
        _context.FamilyMembers.Update(member);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Member {FamilyMemberId} in family {FamilyId} role updated from {OldRole} to {NewRole} by user {CurrentUserId}",
            familyMemberId,
            familyId,
            oldRole,
            newRole,
            currentUserId
        );

        return member;
    }

    public async Task<Family> UpdateAsync(Family family)
    {
        family.UpdatedAt = DateTime.UtcNow;
        _context.Families.Update(family);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Family {FamilyId} updated", family.FamilyId);

        return family;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int familyId)
    {
        var family = await _context.Families.FindAsync(familyId);
        if (family != null)
        {
            _context.Families.Remove(family);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Family {FamilyId} deleted", familyId);
        }
    }

    public async System.Threading.Tasks.Task DeleteBulkAsync(List<int> familyIds)
    {
        var families = await _context
            .Families.Where(f => familyIds.Contains(f.FamilyId))
            .ToListAsync();

        _context.Families.RemoveRange(families);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted {Count} families", families.Count);
    }

    private async Task<User?> GetOrSyncUserByEmailAsync(string normalizedEmail)
    {
        var localUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (localUser != null)
            return localUser;

        try
        {
            var client = _httpClientFactory.CreateClient("IdentityApi");

            var token = _httpContextAccessor
                .HttpContext?.Request.Headers["Authorization"]
                .ToString();
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue(
                        token.StartsWith("Bearer ") ? "Bearer" : token.Split(' ')[0],
                        token.Contains(" ") ? token.Split(' ')[1] : token
                    );
            }

            var response = await client.GetAsync(
                $"/admin/users/by-email?email={Uri.EscapeDataString(normalizedEmail)}"
            );

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Identity API returned {StatusCode} for email {Email}",
                    response.StatusCode,
                    normalizedEmail
                );
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var jsonDoc = System.Text.Json.JsonDocument.Parse(content);
            var root = jsonDoc.RootElement;

            if (
                !root.TryGetProperty("id", out var idElement)
                || !Guid.TryParse(idElement.GetString(), out var identityUserId)
            )
            {
                _logger.LogWarning(
                    "Invalid response from Identity API for email {Email}",
                    normalizedEmail
                );
                return null;
            }

            var displayName = normalizedEmail;
            if (root.TryGetProperty("userName", out var userNameElement))
            {
                displayName = userNameElement.GetString() ?? normalizedEmail;
            }

            var syncedUser = await _userService.GetOrCreateLocalUserAsync(
                identityUserId.ToString(),
                normalizedEmail,
                displayName
            );

            _logger.LogInformation(
                "Synced user {UserId} from Identity API for email {Email}",
                syncedUser.UserId,
                normalizedEmail
            );
            return syncedUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error syncing user from Identity API for email {Email}",
                normalizedEmail
            );
            return null;
        }
    }
}
