using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/references")]
public class ReferencesController : ControllerBase
{
    private readonly CoreDbContext _context;

    public ReferencesController(CoreDbContext context)
    {
        _context = context;
    }

    // GET: api/resumes/{resumeId}/references
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReferenceDto>>> GetReferences(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        var references = await _context
            .References.Where(r => r.ResumeId == resumeId)
            .OrderBy(r => r.Name)
            .ToListAsync();

        return Ok(references.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/references/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ReferenceDto>> GetReference(Guid resumeId, Guid id)
    {
        var reference = await _context.References.FirstOrDefaultAsync(r =>
            r.Id == id && r.ResumeId == resumeId
        );

        if (reference == null)
            return NotFound();

        return Ok(MapToDto(reference));
    }

    // POST: api/resumes/{resumeId}/references
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReferenceDto>> CreateReference(
        Guid resumeId,
        [FromBody] CreateReferenceRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var reference = new Reference
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Name = request.Name,
            Position = request.Position,
            Company = request.Company,
            Email = request.Email,
            Phone = request.Phone,
            Relationship = request.Relationship ?? string.Empty,
        };

        _context.References.Add(reference);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetReference),
            new { resumeId, id = reference.Id },
            MapToDto(reference)
        );
    }

    // PUT: api/resumes/{resumeId}/references/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateReference(
        Guid resumeId,
        Guid id,
        [FromBody] UpdateReferenceRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var reference = await _context.References.FirstOrDefaultAsync(r =>
            r.Id == id && r.ResumeId == resumeId
        );

        if (reference == null)
            return NotFound();

        reference.Name = request.Name;
        reference.Position = request.Position;
        reference.Company = request.Company;
        reference.Email = request.Email;
        reference.Phone = request.Phone;
        reference.Relationship = request.Relationship ?? string.Empty;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/references/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteReference(Guid resumeId, Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var reference = await _context.References.FirstOrDefaultAsync(r =>
            r.Id == id && r.ResumeId == resumeId
        );

        if (reference == null)
            return NotFound();

        _context.References.Remove(reference);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ReferenceDto MapToDto(Reference reference)
    {
        return new ReferenceDto
        {
            Id = reference.Id,
            Name = reference.Name,
            Position = reference.Position,
            Company = reference.Company,
            Email = reference.Email,
            Phone = reference.Phone,
            Relationship = reference.Relationship,
        };
    }
}

// DTOs for ReferencesController
public class CreateReferenceRequest
{
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Relationship { get; set; }
}

public class UpdateReferenceRequest
{
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Relationship { get; set; }
}

public class ReferenceDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Relationship { get; set; } = string.Empty;
}
