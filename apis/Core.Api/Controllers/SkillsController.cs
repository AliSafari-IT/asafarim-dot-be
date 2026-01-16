using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Api.Data;
using Core.Api.DTOs.Resume;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/[controller]")]
[Authorize]
public class SkillsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<SkillsController> _logger;

    public SkillsController(CoreDbContext context, ILogger<SkillsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/resumes/{resumeId}/skills
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SkillDto>>> GetSkills(Guid resumeId)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var skills = await _context
            .Skills.Where(s => s.ResumeId == resumeId)
            .OrderBy(s => s.Category)
            .ThenBy(s => s.Name)
            .ToListAsync();

        return Ok(skills.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/skills/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<SkillDto>> GetSkill(Guid resumeId, Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var skill = await _context.Skills.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );
        if (skill == null)
            return NotFound();

        return Ok(MapToDto(skill));
    }

    // POST: api/resumes/{resumeId}/skills
    [HttpPost]
    public async Task<ActionResult<SkillDto>> CreateSkill(Guid resumeId, CreateSkillRequest request)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var skill = new Skill
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Name = request.Name,
            Category = request.Category,
            Level = Enum.Parse<SkillLevel>(request.Level),
            Rating = request.Rating,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.Skills.Add(skill);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSkill), new { resumeId, id = skill.Id }, MapToDto(skill));
    }

    // PUT: api/resumes/{resumeId}/skills/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSkill(Guid resumeId, Guid id, UpdateSkillRequest request)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var skill = await _context.Skills.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );
        if (skill == null)
            return NotFound();

        skill.Name = request.Name;
        skill.Category = request.Category;
        skill.Level = Enum.Parse<SkillLevel>(request.Level);
        skill.Rating = request.Rating;
        skill.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/skills/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSkill(Guid resumeId, Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var skill = await _context.Skills.FirstOrDefaultAsync(s =>
            s.Id == id && s.ResumeId == resumeId
        );
        if (skill == null)
            return NotFound();

        _context.Skills.Remove(skill);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static SkillDto MapToDto(Skill skill)
    {
        return new SkillDto
        {
            Id = skill.Id,
            Name = skill.Name,
            Category = skill.Category?.ToString() ?? string.Empty,
            Level = skill.Level.ToString(),
            Rating = skill.Rating,
            CreatedAt = skill.CreatedAt,
            UpdatedAt = skill.UpdatedAt,
        };
    }
}

// SkillDto is now in Core.Api.Controllers.Resume.ResumeDtos.cs

public class CreateSkillRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = "Intermediate";
    public int Rating { get; set; }
}

public class UpdateSkillRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = "Intermediate";
    public int Rating { get; set; }
}
