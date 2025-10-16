using Core.Api.Data;
using Core.Api.DTOs.Portfolio;
using Core.Api.Models.Resume;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Services;

public class PortfolioService : IPortfolioService
{
    private readonly CoreDbContext _context;
    private readonly ILogger<PortfolioService> _logger;

    public PortfolioService(CoreDbContext context, ILogger<PortfolioService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PublicPortfolioDto?> GetPublicPortfolioBySlugAsync(string publicSlug)
    {
        var settings = await _context.PortfolioSettings
            .FirstOrDefaultAsync(ps => ps.PublicSlug == publicSlug && ps.IsPublic);

        if (settings == null) return null;

        return await BuildPublicPortfolioDtoAsync(settings.UserId);
    }

    public async Task<PublicPortfolioDto?> GetUserPortfolioAsync(Guid userId)
    {
        return await BuildPublicPortfolioDtoAsync(userId);
    }

    private async Task<PublicPortfolioDto?> BuildPublicPortfolioDtoAsync(Guid userId)
    {
        var userIdString = userId.ToString();
        
        var resume = await _context.Resumes
            .Include(r => r.Contact)
            .Include(r => r.Projects)
                .ThenInclude(p => p.ProjectTechnologies)
                .ThenInclude(pt => pt.Technology)
            .Include(r => r.Projects)
                .ThenInclude(p => p.ProjectImages)
            .Include(r => r.Projects)
                .ThenInclude(p => p.ProjectPublications)
                .ThenInclude(pp => pp.Publication)
            .Include(r => r.Projects)
                .ThenInclude(p => p.ProjectWorkExperiences)
                .ThenInclude(pw => pw.WorkExperience)
            .Include(r => r.WorkExperiences)
            .Include(r => r.Skills)
            .FirstOrDefaultAsync(r => r.UserId == userIdString);

        if (resume == null) return null;

        var publications = await _context.Publications
            .Where(p => p.UserId == userIdString)
            .ToListAsync();

        // Get all technologies used in projects
        var projectTechIds = resume.Projects
            .SelectMany(p => p.ProjectTechnologies.Select(pt => pt.TechnologyId))
            .Distinct()
            .ToList();
            
        var technologies = await _context.Technologies
            .Where(t => projectTechIds.Contains(t.Id))
            .ToListAsync();

        var dto = new PublicPortfolioDto
        {
            UserName = resume.Contact?.FullName ?? "User",
            FullName = resume.Contact?.FullName,
            Bio = resume.Summary,
            Email = resume.Contact?.Email,
            Location = resume.Contact?.Location,
            Website = null, // Not in ContactInfo model
            GithubUrl = null, // Not in ContactInfo model
            LinkedInUrl = null, // Not in ContactInfo model
            PreferredLanguage = "en", // TODO: Get from AspNetUsers
            LastUpdated = resume.UpdatedAt
        };

        var projects = resume.Projects
            .OrderBy(p => p.DisplayOrder)
            .Select(MapToProjectShowcaseDto)
            .ToList();

        dto.FeaturedProjects = projects.Where(p => p.IsFeatured).ToList();
        dto.AllProjects = projects;

        dto.Technologies = technologies
            .Select(t => new TechnologyDto
            {
                Id = t.Id,
                Name = t.Name,
                Category = t.Category,
                ProficiencyLevel = null // Not in Technology model
            })
            .ToList();

        dto.WorkExperiences = resume.WorkExperiences
            .OrderByDescending(w => w.StartDate)
            .Select(w => new WorkExperienceDto
            {
                Id = w.Id,
                JobTitle = w.JobTitle,
                CompanyName = w.CompanyName,
                Location = w.Location,
                StartDate = w.StartDate,
                EndDate = w.EndDate,
                Description = w.Description
            })
            .ToList();

        dto.Publications = publications
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PublicationDto
            {
                Id = p.Id,
                Title = p.Title,
                Authors = p.AuthorId, // Using AuthorId as Authors field
                Journal = p.JournalName,
                PublishedDate = p.CreatedAt,
                Url = p.Link
            })
            .ToList();

        return dto;
    }

    private ProjectShowcaseDto MapToProjectShowcaseDto(Project project)
    {
        return new ProjectShowcaseDto
        {
            Id = project.Id,
            Name = project.Name,
            Description = project.Description,
            ShortDescription = project.ShortDescription,
            Link = project.Link,
            GithubUrl = project.GithubUrl,
            DemoUrl = project.DemoUrl,
            StartDate = project.StartDate,
            EndDate = project.EndDate,
            IsFeatured = project.IsFeatured,
            DisplayOrder = project.DisplayOrder,
            Technologies = project.ProjectTechnologies
                .Select(pt => new TechnologyDto
                {
                    Id = pt.Technology.Id,
                    Name = pt.Technology.Name,
                    Category = pt.Technology.Category
                })
                .ToList(),
            Images = project.ProjectImages
                .OrderBy(i => i.DisplayOrder)
                .Select(i => new ProjectImageDto
                {
                    Id = i.Id,
                    ImageUrl = i.ImageUrl,
                    Caption = i.Caption,
                    DisplayOrder = i.DisplayOrder,
                    IsPrimary = i.IsPrimary
                })
                .ToList(),
            PublicationTitles = project.ProjectPublications
                .Select(pp => pp.Publication.Title)
                .ToList(),
            RelatedWorkExperiences = project.ProjectWorkExperiences
                .Select(pw => pw.WorkExperience.JobTitle)
                .ToList()
        };
    }

    public async Task<PortfolioSettingsDto?> GetPortfolioSettingsAsync(Guid userId)
    {
        var settings = await _context.PortfolioSettings
            .FirstOrDefaultAsync(ps => ps.UserId == userId);

        if (settings == null) return null;

        return new PortfolioSettingsDto
        {
            Id = settings.Id,
            PublicSlug = settings.PublicSlug,
            IsPublic = settings.IsPublic,
            Theme = settings.Theme,
            SectionOrder = settings.GetSectionOrder().ToList(),
            UpdatedAt = settings.UpdatedAt
        };
    }

    public async Task<PortfolioSettingsDto> UpdatePortfolioSettingsAsync(Guid userId, UpdatePortfolioSettingsDto dto)
    {
        var existing = await _context.PortfolioSettings
            .FirstOrDefaultAsync(ps => ps.UserId == userId);

        if (existing != null)
        {
            existing.PublicSlug = dto.PublicSlug;
            existing.IsPublic = dto.IsPublic;
            existing.Theme = dto.Theme;
            if (dto.SectionOrder != null)
            {
                existing.SetSectionOrder(dto.SectionOrder.ToArray());
            }
            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new PortfolioSettingsDto
            {
                Id = existing.Id,
                PublicSlug = existing.PublicSlug,
                IsPublic = existing.IsPublic,
                Theme = existing.Theme,
                SectionOrder = dto.SectionOrder,
                UpdatedAt = existing.UpdatedAt
            };
        }

        var settings = new PortfolioSettings
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PublicSlug = dto.PublicSlug,
            IsPublic = dto.IsPublic,
            Theme = dto.Theme,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        if (dto.SectionOrder != null)
        {
            settings.SetSectionOrder(dto.SectionOrder.ToArray());
        }

        _context.PortfolioSettings.Add(settings);
        await _context.SaveChangesAsync();

        return new PortfolioSettingsDto
        {
            Id = settings.Id,
            PublicSlug = settings.PublicSlug,
            IsPublic = settings.IsPublic,
            Theme = settings.Theme,
            SectionOrder = dto.SectionOrder,
            UpdatedAt = settings.UpdatedAt
        };
    }

    public async Task<bool> IsPublicSlugAvailableAsync(string publicSlug, Guid? excludeUserId = null)
    {
        var query = _context.PortfolioSettings.Where(ps => ps.PublicSlug == publicSlug);

        if (excludeUserId.HasValue)
        {
            query = query.Where(ps => ps.UserId != excludeUserId.Value);
        }

        return !await query.AnyAsync();
    }

    public async Task<ProjectShowcaseDto> CreateProjectAsync(Guid userId, CreateProjectDto dto)
    {
        var userIdString = userId.ToString();
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.UserId == userIdString);

        if (resume == null)
        {
            throw new InvalidOperationException("User does not have a resume");
        }

        var project = new Project
        {
            Id = Guid.NewGuid(),
            ResumeId = resume.Id,
            Name = dto.Name,
            Description = dto.Description,
            ShortDescription = dto.ShortDescription,
            Link = dto.Link ?? string.Empty,
            GithubUrl = dto.GithubUrl,
            DemoUrl = dto.DemoUrl,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsFeatured = dto.IsFeatured,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Projects.Add(project);

        // Add technology associations
        foreach (var techId in dto.TechnologyIds)
        {
            _context.ProjectTechnologies.Add(new ProjectTechnology
            {
                ProjectId = project.Id,
                TechnologyId = techId
            });
        }

        // Add publication associations
        foreach (var pubId in dto.PublicationIds)
        {
            _context.ProjectPublications.Add(new ProjectPublication
            {
                ProjectId = project.Id,
                PublicationId = pubId
            });
        }

        // Add work experience associations
        foreach (var weId in dto.WorkExperienceIds)
        {
            _context.ProjectWorkExperiences.Add(new ProjectWorkExperience
            {
                ProjectId = project.Id,
                WorkExperienceId = weId
            });
        }

        // Add images
        foreach (var img in dto.Images)
        {
            _context.ProjectImages.Add(new ProjectImage
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                ImageUrl = img.ImageUrl,
                Caption = img.Caption,
                DisplayOrder = img.DisplayOrder,
                IsPrimary = img.IsPrimary,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        // Reload with includes
        var created = await _context.Projects
            .Include(p => p.ProjectTechnologies).ThenInclude(pt => pt.Technology)
            .Include(p => p.ProjectImages)
            .Include(p => p.ProjectPublications).ThenInclude(pp => pp.Publication)
            .Include(p => p.ProjectWorkExperiences).ThenInclude(pw => pw.WorkExperience)
            .FirstAsync(p => p.Id == project.Id);

        return MapToProjectShowcaseDto(created);
    }

    public async Task<ProjectShowcaseDto?> UpdateProjectAsync(Guid userId, Guid projectId, UpdateProjectDto dto)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .Include(p => p.ProjectTechnologies)
            .Include(p => p.ProjectPublications)
            .Include(p => p.ProjectWorkExperiences)
            .Include(p => p.ProjectImages)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        if (project == null) return null;

        // Update basic fields
        project.Name = dto.Name;
        project.Description = dto.Description;
        project.ShortDescription = dto.ShortDescription;
        project.Link = dto.Link ?? string.Empty;
        project.GithubUrl = dto.GithubUrl;
        project.DemoUrl = dto.DemoUrl;
        project.StartDate = dto.StartDate;
        project.EndDate = dto.EndDate;
        project.IsFeatured = dto.IsFeatured;
        project.DisplayOrder = dto.DisplayOrder;
        project.UpdatedAt = DateTime.UtcNow;

        // Update technologies
        _context.ProjectTechnologies.RemoveRange(project.ProjectTechnologies);
        foreach (var techId in dto.TechnologyIds)
        {
            _context.ProjectTechnologies.Add(new ProjectTechnology
            {
                ProjectId = project.Id,
                TechnologyId = techId
            });
        }

        // Update publications
        _context.ProjectPublications.RemoveRange(project.ProjectPublications);
        foreach (var pubId in dto.PublicationIds)
        {
            _context.ProjectPublications.Add(new ProjectPublication
            {
                ProjectId = project.Id,
                PublicationId = pubId
            });
        }

        // Update work experiences
        _context.ProjectWorkExperiences.RemoveRange(project.ProjectWorkExperiences);
        foreach (var weId in dto.WorkExperienceIds)
        {
            _context.ProjectWorkExperiences.Add(new ProjectWorkExperience
            {
                ProjectId = project.Id,
                WorkExperienceId = weId
            });
        }

        // Update images
        _context.ProjectImages.RemoveRange(project.ProjectImages);
        foreach (var img in dto.Images)
        {
            _context.ProjectImages.Add(new ProjectImage
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                ImageUrl = img.ImageUrl,
                Caption = img.Caption,
                DisplayOrder = img.DisplayOrder,
                IsPrimary = img.IsPrimary,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        // Reload with includes
        var updated = await _context.Projects
            .Include(p => p.ProjectTechnologies).ThenInclude(pt => pt.Technology)
            .Include(p => p.ProjectImages)
            .Include(p => p.ProjectPublications).ThenInclude(pp => pp.Publication)
            .Include(p => p.ProjectWorkExperiences).ThenInclude(pw => pw.WorkExperience)
            .FirstAsync(p => p.Id == project.Id);

        return MapToProjectShowcaseDto(updated);
    }

    public async Task<bool> DeleteProjectAsync(Guid userId, Guid projectId)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        if (project == null) return false;

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProjectShowcaseDto>> GetUserProjectsAsync(Guid userId)
    {
        var userIdString = userId.ToString();
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.UserId == userIdString);

        if (resume == null) return new List<ProjectShowcaseDto>();

        var projects = await _context.Projects
            .Include(p => p.ProjectTechnologies).ThenInclude(pt => pt.Technology)
            .Include(p => p.ProjectImages)
            .Include(p => p.ProjectPublications).ThenInclude(pp => pp.Publication)
            .Include(p => p.ProjectWorkExperiences).ThenInclude(pw => pw.WorkExperience)
            .Where(p => p.ResumeId == resume.Id)
            .OrderBy(p => p.DisplayOrder)
            .ToListAsync();

        return projects.Select(MapToProjectShowcaseDto).ToList();
    }

    public async Task<ProjectShowcaseDto?> GetProjectByIdAsync(Guid userId, Guid projectId)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .Include(p => p.ProjectTechnologies).ThenInclude(pt => pt.Technology)
            .Include(p => p.ProjectImages)
            .Include(p => p.ProjectPublications).ThenInclude(pp => pp.Publication)
            .Include(p => p.ProjectWorkExperiences).ThenInclude(pw => pw.WorkExperience)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        return project == null ? null : MapToProjectShowcaseDto(project);
    }
}
