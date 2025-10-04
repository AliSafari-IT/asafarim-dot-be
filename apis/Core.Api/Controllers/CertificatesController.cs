using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models.Resume;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/resumes/{resumeId}/certificates")]
public class CertificatesController : ControllerBase
{
    private readonly CoreDbContext _context;

    public CertificatesController(CoreDbContext context)
    {
        _context = context;
    }

    // GET: api/resumes/{resumeId}/certificates
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CertificateDto>>> GetCertificates(Guid resumeId)
    {
        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        var certificates = await _context
            .Certificates.Where(c => c.ResumeId == resumeId)
            .OrderByDescending(c => c.IssueDate)
            .ToListAsync();

        return Ok(certificates.Select(MapToDto));
    }

    // GET: api/resumes/{resumeId}/certificates/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<CertificateDto>> GetCertificate(Guid resumeId, Guid id)
    {
        var certificate = await _context.Certificates.FirstOrDefaultAsync(c =>
            c.Id == id && c.ResumeId == resumeId
        );

        if (certificate == null)
            return NotFound();

        return Ok(MapToDto(certificate));
    }

    // POST: api/resumes/{resumeId}/certificates
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<CertificateDto>> CreateCertificate(
        Guid resumeId,
        [FromBody] CreateCertificateRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var certificate = new Certificate
        {
            Id = Guid.NewGuid(),
            ResumeId = resumeId,
            Name = request.Name,
            Issuer = request.Issuer,
            IssueDate = request.IssueDate,
            ExpiryDate = request.ExpiryDate,
            CredentialId = request.CredentialId ?? string.Empty,
            CredentialUrl = request.CredentialUrl ?? string.Empty,
        };

        _context.Certificates.Add(certificate);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetCertificate),
            new { resumeId, id = certificate.Id },
            MapToDto(certificate)
        );
    }

    // PUT: api/resumes/{resumeId}/certificates/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateCertificate(
        Guid resumeId,
        Guid id,
        [FromBody] UpdateCertificateRequest request
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var certificate = await _context.Certificates.FirstOrDefaultAsync(c =>
            c.Id == id && c.ResumeId == resumeId
        );

        if (certificate == null)
            return NotFound();

        certificate.Name = request.Name;
        certificate.Issuer = request.Issuer;
        certificate.IssueDate = request.IssueDate;
        certificate.ExpiryDate = request.ExpiryDate;
        certificate.CredentialId = request.CredentialId ?? string.Empty;
        certificate.CredentialUrl = request.CredentialUrl ?? string.Empty;
        certificate.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{resumeId}/certificates/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteCertificate(Guid resumeId, Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(resumeId);
        if (resume == null)
            return NotFound();

        if (!isAdmin && resume.UserId != userId)
            return Forbid();

        var certificate = await _context.Certificates.FirstOrDefaultAsync(c =>
            c.Id == id && c.ResumeId == resumeId
        );

        if (certificate == null)
            return NotFound();

        _context.Certificates.Remove(certificate);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CertificateDto MapToDto(Certificate certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            Name = certificate.Name,
            Issuer = certificate.Issuer,
            IssueDate = certificate.IssueDate,
            ExpiryDate = certificate.ExpiryDate,
            CredentialId = certificate.CredentialId,
            CredentialUrl = certificate.CredentialUrl,
            CreatedAt = certificate.CreatedAt,
            UpdatedAt = certificate.UpdatedAt,
        };
    }
}

// DTOs for CertificatesController
public class CreateCertificateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
}

public class UpdateCertificateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? CredentialId { get; set; }
    public string? CredentialUrl { get; set; }
}

public class CertificateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string CredentialId { get; set; } = string.Empty;
    public string CredentialUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
