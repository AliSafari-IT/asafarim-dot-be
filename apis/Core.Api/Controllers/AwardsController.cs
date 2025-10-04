using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/awards")]
public class AwardsController : ControllerBase
{
    private readonly CoreDbContext _context;

    public AwardsController(CoreDbContext context)
    {
        _context = context;
    }

    // GET: api/resumes/{resumeId}/awards
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AwardDto>>> GetAwards(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        var awards = await _context
            .Awards.Where(a => a.ResumeId == resumeId)
            .OrderByDescending(a => a.AwardedDate)
            .ToListAsync();

        return Ok(awards.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/awards/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<AwardDto>> GetAward(Guid resumeId, Guid id)
    {
        var award = await _context
            .Awards.FirstOrDefaultAsync(a => a.Id == id && a.ResumeId == resumeId);

        if (award == null)
            return NotFound();

        return Ok(MapToDto(award));
    }

    // POST: api/resumes/{resumeId}/awards
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<AwardDto>> CreateAward(
        Guid resumeId,
        [FromBody] CreateAwardRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var award = new Award
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Title = request.Title,
            Issuer = request.Issuer,
            AwardedDate = request.Date,
            Description = request.Description ?? string.Empty,
        };

        _context.Awards.Add(award);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAward),
            new { resumeId, id = award.Id },
            MapToDto(award)
        );
    }

    // PUT: api/resumes/{resumeId}/awards/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateAward(
        Guid resumeId,
        Guid id,
        [FromBody] UpdateAwardRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var award = await _context
            .Awards.FirstOrDefaultAsync(a => a.Id == id && a.ResumeId == resumeId);

        if (award == null)
            return NotFound();

        award.Title = request.Title;
        award.Issuer = request.Issuer;
        award.AwardedDate = request.Date;
        award.Description = request.Description ?? string.Empty;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/awards/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteAward(Guid resumeId, Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var award = await _context
            .Awards.FirstOrDefaultAsync(a => a.Id == id && a.ResumeId == resumeId);

        if (award == null)
            return NotFound();

        _context.Awards.Remove(award);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static AwardDto MapToDto(Award award)
    {
        return new AwardDto
        {
            Id = award.Id,
            Title = award.Title,
            Issuer = award.Issuer,
            Date = award.AwardedDate,
            Description = award.Description,
        };
    }
}

// DTOs for AwardsController
public class CreateAwardRequest
{
    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}

public class UpdateAwardRequest
{
    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string? Description { get; set; }
}

public class AwardDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
}
