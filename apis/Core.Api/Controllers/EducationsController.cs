using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Api.Controllers.Dtos;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/[controller]")]
[Authorize]
public class EducationsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<EducationsController> _logger;

    public EducationsController(CoreDbContext context, ILogger<EducationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/resumes/{resumeId}/educations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EducationDto>>> GetEducations(Guid resumeId)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var educations = await _context.Educations
            .Where(e => e.ResumeId == resumeId)
            .OrderByDescending(e => e.StartDate)
            .ToListAsync();

        return Ok(educations.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/educations/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<EducationDto>> GetEducation(Guid resumeId, Guid id)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var education = await _context.Educations.FirstOrDefaultAsync(e => e.Id == id && e.ResumeId == resumeId);
        if (education == null) return NotFound();

        return Ok(MapToDto(education));
    }

    // POST: api/resumes/{resumeId}/educations
    [HttpPost]
    public async Task<ActionResult<EducationDto>> CreateEducation(Guid resumeId, CreateEducationRequest request)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var education = new Education
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Institution = request.Institution,
            Degree = request.Degree,
            FieldOfStudy = request.FieldOfStudy,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) : null,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Educations.Add(education);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEducation), new { resumeId, id = education.Id }, MapToDto(education));
    }

    // PUT: api/resumes/{resumeId}/educations/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEducation(Guid resumeId, Guid id, UpdateEducationRequest request)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var education = await _context.Educations.FirstOrDefaultAsync(e => e.Id == id && e.ResumeId == resumeId);
        if (education == null) return NotFound();

        education.Institution = request.Institution;
        education.Degree = request.Degree;
        education.FieldOfStudy = request.FieldOfStudy;
        education.StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc);
        education.EndDate = request.EndDate.HasValue ? DateTime.SpecifyKind(request.EndDate.Value, DateTimeKind.Utc) : null;
        education.Description = request.Description;
        education.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/educations/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEducation(Guid resumeId, Guid id)
    {
        var userId = User.FindFirst("sub")?.Value ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null) return NotFound("Resume not found");

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var education = await _context.Educations.FirstOrDefaultAsync(e => e.Id == id && e.ResumeId == resumeId);
        if (education == null) return NotFound();

        _context.Educations.Remove(education);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static EducationDto MapToDto(Education education)
    {
        return new EducationDto
        {
            Id = education.Id,
            Institution = education.Institution,
            Degree = education.Degree,
            FieldOfStudy = education.FieldOfStudy,
            StartDate = education.StartDate,
            EndDate = education.EndDate,
            Description = education.Description,
            CreatedAt = education.CreatedAt,
            UpdatedAt = education.UpdatedAt
        };
    }
}

// EducationDto is now in Core.Api.Controllers.Resume.ResumeDtos.cs

public class CreateEducationRequest
{
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class UpdateEducationRequest
{
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Description { get; set; } = string.Empty;
}
