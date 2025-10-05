using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/social-links")]
public class SocialLinksController : ControllerBase
{
    private readonly CoreDbContext _context;

    public SocialLinksController(CoreDbContext context)
    {
        _context = context;
    }

    // GET: api/resumes/{resumeId}/social-links
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SocialLinkDto>>> GetSocialLinks(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        var socialLinks = await _context
            .SocialLinks.Where(s => s.ResumeId == resumeId)
            .OrderBy(s => s.Platform)
            .ToListAsync();

        return Ok(socialLinks.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/social-links/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<SocialLinkDto>> GetSocialLink(Guid resumeId, Guid id)
    {
        var socialLink = await _context.SocialLinks.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );

        if (socialLink == null)
            return NotFound();

        return Ok(MapToDto(socialLink));
    }

    // POST: api/resumes/{resumeId}/social-links
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<SocialLinkDto>> CreateSocialLink(
        Guid resumeId,
        [FromBody] CreateSocialLinkRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var socialLink = new SocialLink
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Platform = request.Platform,
            Url = request.Url,
        };

        _context.SocialLinks.Add(socialLink);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSocialLink),
            new { resumeId, id = socialLink.Id },
            MapToDto(socialLink)
        );
    }

    // PUT: api/resumes/{resumeId}/social-links/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateSocialLink(
        Guid resumeId,
        Guid id,
        [FromBody] UpdateSocialLinkRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var socialLink = await _context.SocialLinks.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );

        if (socialLink == null)
            return NotFound();

        socialLink.Platform = request.Platform;
        socialLink.Url = request.Url;
        socialLink.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/social-links/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteSocialLink(Guid resumeId, Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var socialLink = await _context.SocialLinks.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );

        if (socialLink == null)
            return NotFound();

        _context.SocialLinks.Remove(socialLink);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static SocialLinkDto MapToDto(SocialLink socialLink)
    {
        return new SocialLinkDto
        {
            Id = socialLink.Id,
            Platform = socialLink.Platform,
            Url = socialLink.Url,
            CreatedAt = socialLink.CreatedAt,
            UpdatedAt = socialLink.UpdatedAt,
        };
    }
}

// DTOs for SocialLinksController
public class CreateSocialLinkRequest
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public class UpdateSocialLinkRequest
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public class SocialLinkDto
{
    public Guid Id { get; set; }
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
