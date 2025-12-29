using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class FamilyService : IFamilyService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<FamilyService> _logger;

    public FamilyService(SmartPathDbContext context, ILogger<FamilyService> logger)
    {
        _context = context;
        _logger = logger;
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
            Role = "FamilyAdmin",
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
        int userId,
        string role,
        DateTime? dateOfBirth = null
    )
    {
        var existingMember = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );

        if (existingMember != null)
        {
            throw new InvalidOperationException("User is already a member of this family");
        }

        var familyMember = new FamilyMember
        {
            FamilyId = familyId,
            UserId = userId,
            Role = role,
            DateOfBirth = dateOfBirth,
            JoinedAt = DateTime.UtcNow,
        };

        _context.FamilyMembers.Add(familyMember);
        await _context.SaveChangesAsync();

        return familyMember;
    }

    public async System.Threading.Tasks.Task RemoveMemberAsync(int familyId, int userId)
    {
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );

        if (member != null)
        {
            _context.FamilyMembers.Remove(member);
            await _context.SaveChangesAsync();
        }
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
        var families = await _context.Families
            .Where(f => familyIds.Contains(f.FamilyId))
            .ToListAsync();

        _context.Families.RemoveRange(families);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted {Count} families", families.Count);
    }
}
