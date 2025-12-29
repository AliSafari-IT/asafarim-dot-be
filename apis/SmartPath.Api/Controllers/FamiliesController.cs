using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class FamiliesController : ControllerBase
{
    private readonly IFamilyService _familyService;

    public FamiliesController(IFamilyService familyService)
    {
        _familyService = familyService;
    }

    private IActionResult? ValidateUserContext(out int userId)
    {
        userId = 0;
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                return StatusCode(500, new { error = "Failed to sync user: " + errorObj });
            }
            return Unauthorized(new { error = "User context not available" });
        }

        userId = (int)userIdObj;
        return null;
    }

    [HttpGet("my-families")]
    public async Task<IActionResult> GetMyFamilies()
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;

        var families = await _familyService.GetUserFamiliesAsync(userId);

        return Ok(
            families.Select(f => new
            {
                f.FamilyId,
                f.FamilyName,
                f.CreatedAt,
                MemberCount = f.Members.Count,
                Members = f.Members.Select(m => new
                {
                    m.FamilyMemberId,
                    m.UserId,
                    m.Role,
                    m.DateOfBirth,
                    m.JoinedAt,
                    UserName = m.User?.DisplayName,
                }),
            })
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFamily(int id)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;
        var family = await _familyService.GetByIdAsync(id);

        if (family == null)
            return NotFound();

        if (!await _familyService.IsMemberAsync(id, userId))
            return Forbid();

        return Ok(family);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFamily([FromBody] CreateFamilyRequest request)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;

        try
        {
            var family = await _familyService.CreateAsync(request.FamilyName, userId);
            if (family == null)
                return StatusCode(500, new { error = "Failed to create family" });

            return CreatedAtAction(nameof(GetFamily), new { id = family.FamilyId }, family);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error creating family: " + ex.Message });
        }
    }

    [HttpPost("{familyId}/members")]
    public async Task<IActionResult> AddMember(int familyId, [FromBody] AddMemberRequest request)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;
        var userRole = await _familyService.GetUserRoleAsync(familyId, userId);

        if (userRole != "FamilyAdmin" && userRole != "Parent")
            return Forbid();

        var member = await _familyService.AddMemberAsync(
            familyId,
            request.UserId,
            request.Role,
            request.DateOfBirth
        );

        return Ok(member);
    }

    [HttpDelete("{familyId}/members/{memberId}")]
    public async Task<IActionResult> RemoveMember(int familyId, int memberId)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;
        var userRole = await _familyService.GetUserRoleAsync(familyId, userId);

        if (userRole != "FamilyAdmin" && userRole != "Parent")
            return Forbid();

        await _familyService.RemoveMemberAsync(familyId, memberId);

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFamily(int id, [FromBody] UpdateFamilyRequest request)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;
        var userRole = await _familyService.GetUserRoleAsync(id, userId);

        if (userRole != "FamilyAdmin")
            return Forbid();

        var family = await _familyService.GetByIdAsync(id);
        if (family == null)
            return NotFound();

        family.FamilyName = request.FamilyName;
        var updated = await _familyService.UpdateAsync(family);

        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFamily(int id)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;
        var userRole = await _familyService.GetUserRoleAsync(id, userId);

        if (userRole != "FamilyAdmin")
            return Forbid();

        await _familyService.DeleteAsync(id);

        return NoContent();
    }

    [HttpPost("delete-bulk")]
    public async Task<IActionResult> DeleteBulkFamilies([FromBody] DeleteBulkRequest request)
    {
        var validationError = ValidateUserContext(out var userId);
        if (validationError != null) return validationError;

        foreach (var familyId in request.Ids)
        {
            var userRole = await _familyService.GetUserRoleAsync(familyId, userId);
            if (userRole != "FamilyAdmin")
                return Forbid();
        }

        await _familyService.DeleteBulkAsync(request.Ids);

        return NoContent();
    }
}

public record CreateFamilyRequest(string FamilyName);

public record UpdateFamilyRequest(string FamilyName);

public record AddMemberRequest(int UserId, string Role, DateTime? DateOfBirth);

public record DeleteBulkRequest(List<int> Ids);
