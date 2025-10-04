using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/languages")]
public class LanguagesController : ControllerBase
{
    private readonly CoreDbContext _context;

    public LanguagesController(CoreDbContext context)
    {
        _context = context;
    }

    // GET: api/resumes/{resumeId}/languages
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LanguageDto>>> GetLanguages(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        var languages = await _context
            .Languages.Where(l => l.ResumeId == resumeId)
            .OrderBy(l => l.Name)
            .ToListAsync();

        return Ok(languages.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/languages/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<LanguageDto>> GetLanguage(Guid resumeId, Guid id)
    {
        var language = await _context
            .Languages.FirstOrDefaultAsync(l => l.Id == id && l.ResumeId == resumeId);

        if (language == null)
            return NotFound();

        return Ok(MapToDto(language));
    }

    // POST: api/resumes/{resumeId}/languages
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<LanguageDto>> CreateLanguage(
        Guid resumeId,
        [FromBody] CreateLanguageRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var language = new Language
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Name = request.Name,
            Level = Enum.Parse<LanguageLevel>(request.Level),
        };

        _context.Languages.Add(language);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetLanguage),
            new { resumeId, id = language.Id },
            MapToDto(language)
        );
    }

    // PUT: api/resumes/{resumeId}/languages/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateLanguage(
        Guid resumeId,
        Guid id,
        [FromBody] UpdateLanguageRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var language = await _context
            .Languages.FirstOrDefaultAsync(l => l.Id == id && l.ResumeId == resumeId);

        if (language == null)
            return NotFound();

        language.Name = request.Name;
        language.Level = Enum.Parse<LanguageLevel>(request.Level);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/languages/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteLanguage(Guid resumeId, Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var language = await _context
            .Languages.FirstOrDefaultAsync(l => l.Id == id && l.ResumeId == resumeId);

        if (language == null)
            return NotFound();

        _context.Languages.Remove(language);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static LanguageDto MapToDto(Language language)
    {
        return new LanguageDto
        {
            Id = language.Id,
            Name = language.Name,
            Level = language.Level.ToString(),
        };
    }
}

// DTOs for LanguagesController
public class CreateLanguageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}

public class UpdateLanguageRequest
{
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}

public class LanguageDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}
