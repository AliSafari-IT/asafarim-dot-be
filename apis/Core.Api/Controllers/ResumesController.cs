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
[Route("api/[controller]")]
public class ResumesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<ResumesController> _logger;

    public ResumesController(CoreDbContext context, ILogger<ResumesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/resumes
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ResumeDto>>> GetResumes(
        [FromQuery] bool myResumes = false
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var query = _context.Resumes.Include(r => r.Contact).AsQueryable();

        // Filter by user if not admin or if myResumes is requested
        if (!isAdmin || myResumes)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }
            query = query.Where(r => r.UserId == userId);
        }

        var resumes = await query.OrderByDescending(r => r.UpdatedAt).ToListAsync();

        return Ok(resumes.Select(MapToDto));
    }

    // GET: api/resumes/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ResumeDetailDto>> GetResume(Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context
            .Resumes.Include(r => r.Contact)
            .Include(r => r.Skills)
            .Include(r => r.EducationItems)
            .Include(r => r.Certificates)
            .Include(r => r.WorkExperiences)
            .ThenInclude(w => w.Achievements)
            .Include(r => r.WorkExperiences)
            .ThenInclude(w => w.WorkExperienceTechnologies)
            .ThenInclude(wt => wt.Technology)
            .Include(r => r.Projects)
            .ThenInclude(p => p.ProjectTechnologies)
            .ThenInclude(pt => pt.Technology)
            .Include(r => r.SocialLinks)
            .Include(r => r.Languages)
            .Include(r => r.Awards)
            .Include(r => r.References)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resume == null)
        {
            return NotFound();
        }

        // Check ownership
        if (!isAdmin && resume.UserId != userId)
        {
            return Forbid();
        }

        return Ok(MapToDetailDto(resume));
    }

    // POST: api/resumes
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ResumeDto>> CreateResume(CreateResumeRequest request)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var resume = new Resume
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title,
            Summary = request.Summary,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        // Add contact info if provided
        if (request.Contact != null)
        {
            resume.Contact = new ContactInfo
            {
                Id = Guid.NewGuid(),
                ResumeId = resume.Id,
                FullName = request.Contact.FullName,
                Email = request.Contact.Email,
                Phone = request.Contact.Phone,
                Location = request.Contact.Location,
            };
        }

        _context.Resumes.Add(resume);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetResume), new { id = resume.Id }, MapToDto(resume));
    }

    // PUT: api/resumes/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateResume(Guid id, UpdateResumeRequest request)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context
            .Resumes.Include(r => r.Contact)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (resume == null)
        {
            return NotFound();
        }

        // Check ownership
        if (!isAdmin && resume.UserId != userId)
        {
            return Forbid();
        }

        resume.Title = request.Title;
        resume.Summary = request.Summary;
        resume.UpdatedAt = DateTime.UtcNow;

        // Update contact info
        if (request.Contact != null)
        {
            if (resume.Contact == null)
            {
                resume.Contact = new ContactInfo { Id = Guid.NewGuid(), ResumeId = resume.Id };
            }

            resume.Contact.FullName = request.Contact.FullName;
            resume.Contact.Email = request.Contact.Email;
            resume.Contact.Phone = request.Contact.Phone;
            resume.Contact.Location = request.Contact.Location;
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/resumes/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteResume(Guid id)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        var isAdmin = User.IsInRole("Admin");

        var resume = await _context.Resumes.FindAsync(id);

        if (resume == null)
        {
            return NotFound();
        }

        // Check ownership
        if (!isAdmin && resume.UserId != userId)
        {
            return Forbid();
        }

        _context.Resumes.Remove(resume);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Helper methods
    private static ResumeDto MapToDto(Resume resume)
    {
        return new ResumeDto
        {
            Id = resume.Id,
            UserId = resume.UserId,
            Title = resume.Title,
            Summary = resume.Summary,
            CreatedAt = resume.CreatedAt,
            UpdatedAt = resume.UpdatedAt,
            Contact =
                resume.Contact != null
                    ? new ContactInfoDto
                    {
                        Id = resume.Contact.Id,
                        FullName = resume.Contact.FullName,
                        Email = resume.Contact.Email,
                        Phone = resume.Contact.Phone,
                        Location = resume.Contact.Location,
                    }
                    : null,
        };
    }

    private static ResumeDetailDto MapToDetailDto(Resume resume)
    {
        return new ResumeDetailDto
        {
            Id = resume.Id,
            UserId = resume.UserId,
            Title = resume.Title,
            Summary = resume.Summary,
            CreatedAt = resume.CreatedAt,
            UpdatedAt = resume.UpdatedAt,
            Contact =
                resume.Contact != null
                    ? new ContactInfoDto
                    {
                        Id = resume.Contact.Id,
                        FullName = resume.Contact.FullName,
                        Email = resume.Contact.Email,
                        Phone = resume.Contact.Phone,
                        Location = resume.Contact.Location,
                    }
                    : null,
            Skills = resume
                .Skills.Select(s => new SkillDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Category = s.Category,
                    Level = s.Level.ToString(),
                    Rating = s.Rating,
                })
                .ToList(),
            EducationItems = resume
                .EducationItems.Select(e => new EducationDto
                {
                    Id = e.Id,
                    Institution = e.Institution,
                    Degree = e.Degree,
                    FieldOfStudy = e.FieldOfStudy,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    Description = e.Description,
                })
                .ToList(),
            Certificates = resume
                .Certificates.Select(c => new CertificateDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Issuer = c.Issuer,
                    IssueDate = c.IssueDate,
                    ExpiryDate = c.ExpiryDate,
                    CredentialId = c.CredentialId,
                    CredentialUrl = c.CredentialUrl,
                })
                .ToList(),
            WorkExperiences = resume
                .WorkExperiences.Select(w => new WorkExperienceDto
                {
                    Id = w.Id,
                    JobTitle = w.JobTitle,
                    CompanyName = w.CompanyName,
                    Location = w.Location,
                    StartDate = w.StartDate,
                    EndDate = w.EndDate,
                    IsCurrent = w.IsCurrent,
                    Description = w.Description,
                    Achievements = w
                        .Achievements?.Select(a => new WorkAchievementDto
                        {
                            Id = a.Id,
                            Text = a.Text,
                        })
                        .ToList(),
                    SortOrder = w.SortOrder,
                    Highlighted = w.Highlighted,
                    IsPublished = w.IsPublished,
                    UserId = w.UserId,
                    CreatedAt = w.CreatedAt,
                    UpdatedAt = w.UpdatedAt,
                })
                .ToList(),
            Projects = resume
                .Projects.Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Link = p.Link,
                    Technologies = p.ProjectTechnologies.Select(pt => pt.Technology.Name).ToList(),
                })
                .ToList(),
            SocialLinks = resume
                .SocialLinks.Select(sl => new SocialLinkDto
                {
                    Id = sl.Id,
                    Platform = sl.Platform,
                    Url = sl.Url,
                })
                .ToList(),
            Languages = resume
                .Languages.Select(l => new LanguageDto
                {
                    Id = l.Id,
                    Name = l.Name,
                    Level = l.Level.ToString(),
                })
                .ToList(),
            Awards = resume
                .Awards.Select(a => new AwardDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Issuer = a.Issuer,
                    AwardedDate = a.AwardedDate,
                    Description = a.Description,
                })
                .ToList(),
            References = resume
                .References.Select(r => new ReferenceDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Relationship = r.Relationship,
                    ContactInfo = r.ContactInfo,
                })
                .ToList(),
        };
    }
}

// DTOs
public class ResumeDto
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ContactInfoDto? Contact { get; set; }
}

public class ResumeDetailDto : ResumeDto
{
    public List<SkillDto> Skills { get; set; } = new();
    public List<EducationDto> EducationItems { get; set; } = new();
    public List<CertificateDto> Certificates { get; set; } = new();
    public List<WorkExperienceDto> WorkExperiences { get; set; } = new();
    public List<ProjectDto> Projects { get; set; } = new();
    public List<SocialLinkDto> SocialLinks { get; set; } = new();
    public List<LanguageDto> Languages { get; set; } = new();
    public List<AwardDto> Awards { get; set; } = new();
    public List<ReferenceDto> References { get; set; } = new();
}

public class ContactInfoDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}

// All DTOs are now in Core.Api.Controllers.Resume.ResumeDtos.cs

public class CreateResumeRequest
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public ContactInfoRequest? Contact { get; set; }
}

public class UpdateResumeRequest
{
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public ContactInfoRequest? Contact { get; set; }
}

public class ContactInfoRequest
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
}
