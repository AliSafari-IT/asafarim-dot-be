using System;
using System.Collections.Generic;

namespace Core.Api.Controllers.Dtos;

// Public DTOs for GDPR-compliant resume sharing
// These DTOs exclude sensitive information (no contact details, no internal IDs, no user IDs)

public class PublicResumeDto
{
    public string PublicSlug { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public DateTime? PublishedAt { get; set; }

    public IEnumerable<PublicSkillDto> Skills { get; set; } = Array.Empty<PublicSkillDto>();
    public IEnumerable<PublicWorkExperienceDto> WorkExperiences { get; set; } = Array.Empty<PublicWorkExperienceDto>();
    public IEnumerable<PublicEducationDto> EducationItems { get; set; } = Array.Empty<PublicEducationDto>();
    public IEnumerable<PublicProjectDto> Projects { get; set; } = Array.Empty<PublicProjectDto>();
    public IEnumerable<PublicCertificateDto> Certificates { get; set; } = Array.Empty<PublicCertificateDto>();
    public IEnumerable<PublicLanguageDto> Languages { get; set; } = Array.Empty<PublicLanguageDto>();
    public IEnumerable<PublicAwardDto> Awards { get; set; } = Array.Empty<PublicAwardDto>();
    public IEnumerable<PublicSocialLinkDto> SocialLinks { get; set; } = Array.Empty<PublicSocialLinkDto>();
}

public class PublicSkillDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
    public int Rating { get; set; }
}

public class PublicWorkExperienceDto
{
    public string JobTitle { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
    public string? Location { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public bool IsCurrent { get; set; }
    public string? Description { get; set; }
    public List<string> Achievements { get; set; } = new();
    public List<string> Technologies { get; set; } = new();
}

public class PublicEducationDto
{
    public string Institution { get; set; } = string.Empty;
    public string Degree { get; set; } = string.Empty;
    public string FieldOfStudy { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class PublicProjectDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Link { get; set; } = string.Empty;
    public List<string> Technologies { get; set; } = new();
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}

public class PublicCertificateDto
{
    public string Name { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string CredentialUrl { get; set; } = string.Empty;
    // Note: CredentialId is excluded for privacy
}

public class PublicLanguageDto
{
    public string Name { get; set; } = string.Empty;
    public string Level { get; set; } = string.Empty;
}

public class PublicAwardDto
{
    public string Title { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public DateTime AwardedDate { get; set; }
    public string Description { get; set; } = string.Empty;
}

public class PublicSocialLinkDto
{
    public string Platform { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

// Request DTOs for publish/unpublish operations
public class PublishResumeRequest
{
    public bool GenerateSlug { get; set; } = true;
    public string? CustomSlug { get; set; }
}

public class PublishResumeResponse
{
    public string ShareUrl { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public DateTime PublishedAt { get; set; }
}
