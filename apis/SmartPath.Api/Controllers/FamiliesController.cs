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

    private IActionResult? ValidateUserContext(out int userId, out bool isAdmin)
    {
        userId = 0;
        isAdmin = false;
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                return StatusCode(500, new { error = "Failed to sync user: " + errorObj });
            }
            return Unauthorized(new { error = "User context not available" });
        }

        userId = (int)userIdObj;
        isAdmin = User.IsInRole("admin");
        return null;
    }

    [HttpGet("my-families")]
    public async Task<IActionResult> GetMyFamilies()
    {
        var validationError = ValidateUserContext(out var userId, out _);
        if (validationError != null)
            return validationError;

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
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;
        var family = await _familyService.GetByIdAsync(id);

        if (family == null)
            return NotFound();

        if (!isAdmin && !await _familyService.IsMemberAsync(id, userId))
            return Forbid();

        return Ok(family);
    }

    [HttpPost]
    public async Task<IActionResult> CreateFamily([FromBody] CreateFamilyRequest request)
    {
        var validationError = ValidateUserContext(out var userId, out _);
        if (validationError != null)
            return validationError;

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
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        try
        {
            var member = await _familyService.AddMemberAsync(
                familyId,
                userId,
                request.UserId,
                request.Role,
                request.DateOfBirth,
                isAdmin
            );

            return Ok(member);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("{familyId}/members/by-email")]
    public async Task<IActionResult> AddMemberByEmail(
        int familyId,
        [FromBody] AddMemberByEmailRequest request
    )
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        try
        {
            var member = await _familyService.AddMemberByEmailAsync(
                familyId,
                userId,
                request.Email,
                request.Role,
                isAdmin
            );

            return CreatedAtAction(
                nameof(GetFamily),
                new { id = familyId },
                new
                {
                    member.FamilyMemberId,
                    member.UserId,
                    member.Role,
                    member.JoinedAt,
                }
            );
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{familyId}/members/users/{targetUserId:int}")]
    public async Task<IActionResult> RemoveMember(int familyId, int targetUserId)
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        try
        {
            await _familyService.RemoveMemberAsync(familyId, userId, targetUserId, isAdmin);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Member not found" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPut("{familyId}/members/{familyMemberId}/role")]
    public async Task<IActionResult> UpdateMemberRole(
        int familyId,
        int familyMemberId,
        [FromBody] UpdateMemberRoleRequest request
    )
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        try
        {
            var member = await _familyService.UpdateMemberRoleAsync(
                familyId,
                familyMemberId,
                userId,
                request.Role,
                isAdmin
            );

            return Ok(
                new
                {
                    member.FamilyMemberId,
                    member.UserId,
                    member.Role,
                    member.FamilyId,
                }
            );
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Member not found" });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFamily(int id, [FromBody] UpdateFamilyRequest request)
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        if (!await _familyService.CanManageMembersAsync(id, userId, isAdmin))
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
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        if (!await _familyService.CanManageMembersAsync(id, userId, isAdmin))
            return Forbid();

        await _familyService.DeleteAsync(id);

        return NoContent();
    }

    [HttpPost("delete-bulk")]
    public async Task<IActionResult> DeleteBulkFamilies([FromBody] DeleteBulkRequest request)
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null)
            return validationError;

        foreach (var familyId in request.Ids)
        {
            if (!await _familyService.CanManageMembersAsync(familyId, userId, isAdmin))
                return Forbid();
        }

        await _familyService.DeleteBulkAsync(request.Ids);

        return NoContent();
    }
}

public record CreateFamilyRequest(string FamilyName);

public record UpdateFamilyRequest(string FamilyName);

public record AddMemberRequest(int UserId, string? Role = null, DateTime? DateOfBirth = null);

public record AddMemberByEmailRequest(string Email, string? Role = null);

public record UpdateMemberRoleRequest(string Role);

public record DeleteBulkRequest(List<int> Ids);
