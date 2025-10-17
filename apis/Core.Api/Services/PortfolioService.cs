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

    // ==================== Resume Linking - Projects ====================
    
    public async Task<List<ResumeLinkDto>> LinkProjectToResumesAsync(Guid userId, Guid projectId, LinkResumesDto dto)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        if (project == null)
            throw new InvalidOperationException("Project not found or access denied");

        var links = new List<ProjectResumeLink>();
        
        foreach (var resumeId in dto.ResumeIds)
        {
            // Check if resume belongs to user
            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userIdString);
            
            if (resume == null) continue;

            // Check if link already exists
            var existingLink = await _context.Set<ProjectResumeLink>()
                .FirstOrDefaultAsync(l => l.ProjectId == projectId && l.ResumeId == resumeId);
            
            if (existingLink != null) continue;

            var workExperienceId = dto.WorkExperienceLinks?.GetValueOrDefault(resumeId);
            
            var link = new ProjectResumeLink
            {
                Id = Guid.NewGuid(),
                ProjectId = projectId,
                ResumeId = resumeId,
                WorkExperienceId = workExperienceId,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<ProjectResumeLink>().Add(link);
            links.Add(link);
        }

        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Project,
            EntityId = projectId.ToString(),
            EntityName = project.Name,
            Action = ActivityAction.Link,
            Details = $"Linked {links.Count} resume(s)"
        });

        return await GetProjectResumesAsync(userId, projectId);
    }

    public async Task<bool> UnlinkProjectFromResumeAsync(Guid userId, Guid projectId, Guid resumeId)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        if (project == null) return false;

        var link = await _context.Set<ProjectResumeLink>()
            .FirstOrDefaultAsync(l => l.ProjectId == projectId && l.ResumeId == resumeId);

        if (link == null) return false;

        _context.Set<ProjectResumeLink>().Remove(link);
        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Project,
            EntityId = projectId.ToString(),
            EntityName = project.Name,
            Action = ActivityAction.Unlink,
            Details = "Unlinked resume"
        });

        return true;
    }

    public async Task<List<ResumeLinkDto>> GetProjectResumesAsync(Guid userId, Guid projectId)
    {
        var userIdString = userId.ToString();
        var project = await _context.Projects
            .Include(p => p.Resume)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

        if (project == null) return new List<ResumeLinkDto>();

        var links = await _context.Set<ProjectResumeLink>()
            .Include(l => l.Resume)
            .Include(l => l.WorkExperience)
            .Where(l => l.ProjectId == projectId)
            .ToListAsync();

        return links.Select(l => new ResumeLinkDto
        {
            Id = l.Id,
            ResumeId = l.ResumeId,
            ResumeTitle = l.Resume?.Title ?? "Unknown",
            WorkExperienceId = l.WorkExperienceId,
            WorkExperienceTitle = l.WorkExperience != null 
                ? $"{l.WorkExperience.JobTitle} at {l.WorkExperience.CompanyName}" 
                : null,
            CreatedAt = l.CreatedAt,
            Notes = l.Notes
        }).ToList();
    }

    // ==================== Resume Linking - Publications ====================
    
    public async Task<List<ResumeLinkDto>> LinkPublicationToResumesAsync(Guid userId, int publicationId, LinkResumesDto dto)
    {
        var userIdString = userId.ToString();
        var publication = await _context.Publications
            .FirstOrDefaultAsync(p => p.Id == publicationId && p.UserId == userIdString);

        if (publication == null)
            throw new InvalidOperationException("Publication not found or access denied");

        var links = new List<PublicationResumeLink>();
        
        foreach (var resumeId in dto.ResumeIds)
        {
            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userIdString);
            
            if (resume == null) continue;

            var existingLink = await _context.Set<PublicationResumeLink>()
                .FirstOrDefaultAsync(l => l.PublicationId == publicationId && l.ResumeId == resumeId);
            
            if (existingLink != null) continue;

            var link = new PublicationResumeLink
            {
                Id = Guid.NewGuid(),
                PublicationId = publicationId,
                ResumeId = resumeId,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Set<PublicationResumeLink>().Add(link);
            links.Add(link);
        }

        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Publication,
            EntityId = publicationId.ToString(),
            EntityName = publication.Title,
            Action = ActivityAction.Link,
            Details = $"Linked {links.Count} resume(s)"
        });

        return await GetPublicationResumesAsync(userId, publicationId);
    }

    public async Task<bool> UnlinkPublicationFromResumeAsync(Guid userId, int publicationId, Guid resumeId)
    {
        var userIdString = userId.ToString();
        var publication = await _context.Publications
            .FirstOrDefaultAsync(p => p.Id == publicationId && p.UserId == userIdString);

        if (publication == null) return false;

        var link = await _context.Set<PublicationResumeLink>()
            .FirstOrDefaultAsync(l => l.PublicationId == publicationId && l.ResumeId == resumeId);

        if (link == null) return false;

        _context.Set<PublicationResumeLink>().Remove(link);
        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Publication,
            EntityId = publicationId.ToString(),
            EntityName = publication.Title,
            Action = ActivityAction.Unlink,
            Details = "Unlinked resume"
        });

        return true;
    }

    public async Task<List<ResumeLinkDto>> GetPublicationResumesAsync(Guid userId, int publicationId)
    {
        var userIdString = userId.ToString();
        var publication = await _context.Publications
            .FirstOrDefaultAsync(p => p.Id == publicationId && p.UserId == userIdString);

        if (publication == null) return new List<ResumeLinkDto>();

        var links = await _context.Set<PublicationResumeLink>()
            .Include(l => l.Resume)
            .Where(l => l.PublicationId == publicationId)
            .ToListAsync();

        return links.Select(l => new ResumeLinkDto
        {
            Id = l.Id,
            ResumeId = l.ResumeId,
            ResumeTitle = l.Resume?.Title ?? "Unknown",
            CreatedAt = l.CreatedAt,
            Notes = l.Notes
        }).ToList();
    }

    // ==================== Bulk Operations ====================
    
    public async Task<int> BulkLinkResumesToProjectsAsync(Guid userId, BulkLinkResumesDto dto)
    {
        var userIdString = userId.ToString();
        var linkedCount = 0;

        foreach (var projectId in dto.ProjectIds)
        {
            var project = await _context.Projects
                .Include(p => p.Resume)
                .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

            if (project == null) continue;

            foreach (var resumeId in dto.ResumeIds)
            {
                var resume = await _context.Resumes
                    .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userIdString);
                
                if (resume == null) continue;

                var existingLink = await _context.Set<ProjectResumeLink>()
                    .FirstOrDefaultAsync(l => l.ProjectId == projectId && l.ResumeId == resumeId);
                
                if (existingLink != null) continue;

                var link = new ProjectResumeLink
                {
                    Id = Guid.NewGuid(),
                    ProjectId = projectId,
                    ResumeId = resumeId,
                    Notes = dto.Notes,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Set<ProjectResumeLink>().Add(link);
                linkedCount++;
            }
        }

        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Portfolio,
            EntityId = userId.ToString(),
            EntityName = "Portfolio",
            Action = ActivityAction.Link,
            Details = $"Bulk linked {linkedCount} project-resume connections"
        });

        return linkedCount;
    }

    public async Task<int> BulkUnlinkResumesFromProjectsAsync(Guid userId, BulkLinkResumesDto dto)
    {
        var userIdString = userId.ToString();
        var unlinkedCount = 0;

        foreach (var projectId in dto.ProjectIds)
        {
            var project = await _context.Projects
                .Include(p => p.Resume)
                .FirstOrDefaultAsync(p => p.Id == projectId && p.Resume.UserId == userIdString);

            if (project == null) continue;

            foreach (var resumeId in dto.ResumeIds)
            {
                var link = await _context.Set<ProjectResumeLink>()
                    .FirstOrDefaultAsync(l => l.ProjectId == projectId && l.ResumeId == resumeId);

                if (link == null) continue;

                _context.Set<ProjectResumeLink>().Remove(link);
                unlinkedCount++;
            }
        }

        await _context.SaveChangesAsync();

        // Log activity
        await CreateActivityLogAsync(userId, new CreateActivityLogDto
        {
            EntityType = EntityType.Portfolio,
            EntityId = userId.ToString(),
            EntityName = "Portfolio",
            Action = ActivityAction.Unlink,
            Details = $"Bulk unlinked {unlinkedCount} project-resume connections"
        });

        return unlinkedCount;
    }

    // ==================== Analytics & Insights ====================
    
    public async Task<PortfolioInsightsDto> GetPortfolioInsightsAsync(Guid userId)
    {
        var userIdString = userId.ToString();
        
        var resume = await _context.Resumes
            .FirstOrDefaultAsync(r => r.UserId == userIdString);

        if (resume == null)
            return new PortfolioInsightsDto();

        // Project statistics
        var allProjects = await _context.Projects
            .Include(p => p.ProjectResumeLinks)
            .Include(p => p.ProjectTechnologies).ThenInclude(pt => pt.Technology)
            .Where(p => p.ResumeId == resume.Id)
            .ToListAsync();

        var totalProjects = allProjects.Count;
        var linkedProjects = allProjects.Count(p => p.ProjectResumeLinks.Any());
        var unlinkedProjects = totalProjects - linkedProjects;
        var linkingRate = totalProjects > 0 ? (decimal)linkedProjects / totalProjects * 100 : 0;

        // Publication statistics
        var allPublications = await _context.Publications
            .Include(p => p.PublicationResumeLinks)
            .Where(p => p.UserId == userIdString)
            .ToListAsync();

        var totalPublications = allPublications.Count;
        var linkedPublications = allPublications.Count(p => p.PublicationResumeLinks.Any());

        // Resume statistics
        var allResumes = await _context.Resumes
            .Include(r => r.ProjectResumeLinks)
            .Include(r => r.PublicationResumeLinks)
            .Where(r => r.UserId == userIdString)
            .ToListAsync();

        var totalResumes = allResumes.Count;
        var activeResumes = allResumes.Count(r => r.ProjectResumeLinks.Any() || r.PublicationResumeLinks.Any());

        // Most used technologies
        var technologyUsage = allProjects
            .SelectMany(p => p.ProjectTechnologies)
            .GroupBy(pt => new { pt.TechnologyId, pt.Technology?.Name, pt.Technology?.Category })
            .Select(g => new TechnologyUsageDto
            {
                TechnologyId = g.Key.TechnologyId,
                Name = g.Key.Name ?? "Unknown",
                Category = g.Key.Category,
                UsageCount = g.Count()
            })
            .OrderByDescending(t => t.UsageCount)
            .Take(10)
            .ToList();

        // Most linked resumes
        var resumeUsage = allResumes
            .Select(r => new ResumeUsageDto
            {
                ResumeId = r.Id,
                Title = r.Title,
                LinkCount = r.ProjectResumeLinks.Count + r.PublicationResumeLinks.Count,
                LastLinked = r.ProjectResumeLinks.Concat(r.PublicationResumeLinks.Select(prl => 
                    new ProjectResumeLink { CreatedAt = prl.CreatedAt }))
                    .OrderByDescending(l => l.CreatedAt)
                    .FirstOrDefault()?.CreatedAt ?? r.CreatedAt
            })
            .Where(r => r.LinkCount > 0)
            .OrderByDescending(r => r.LinkCount)
            .Take(5)
            .ToList();

        // Last activity
        var lastActivity = await _context.Set<ActivityLog>()
            .Where(a => a.UserId == userIdString)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        // Portfolio health
        var health = linkingRate >= 75 ? "Excellent" : linkingRate >= 50 ? "Good" : "NeedsAttention";

        return new PortfolioInsightsDto
        {
            TotalProjects = totalProjects,
            LinkedProjects = linkedProjects,
            UnlinkedProjects = unlinkedProjects,
            LinkingRate = Math.Round(linkingRate, 2),
            TotalPublications = totalPublications,
            LinkedPublications = linkedPublications,
            TotalResumes = totalResumes,
            ActiveResumes = activeResumes,
            MostUsedTechnologies = technologyUsage,
            MostLinkedResumes = resumeUsage,
            ProjectPublicationOverlaps = new List<ProjectPublicationOverlapDto>(),
            LastActivityDate = lastActivity?.Timestamp,
            PortfolioHealth = health
        };
    }

    // ==================== Activity Tracking ====================
    
    public async Task<List<ActivityLogDto>> GetActivityLogsAsync(Guid userId, int limit = 50)
    {
        var userIdString = userId.ToString();
        
        var logs = await _context.Set<ActivityLog>()
            .Where(a => a.UserId == userIdString)
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync();

        return logs.Select(l => new ActivityLogDto
        {
            Id = l.Id,
            EntityType = l.EntityType,
            EntityId = l.EntityId,
            EntityName = l.EntityName ?? "Unknown",
            Action = l.Action,
            Details = l.Details,
            Timestamp = l.Timestamp
        }).ToList();
    }

    public async Task<ActivityLogDto> CreateActivityLogAsync(Guid userId, CreateActivityLogDto dto)
    {
        var userIdString = userId.ToString();
        
        var log = new ActivityLog
        {
            Id = Guid.NewGuid(),
            UserId = userIdString,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            EntityName = dto.EntityName,
            Action = dto.Action,
            Details = dto.Details,
            Timestamp = DateTime.UtcNow
        };

        _context.Set<ActivityLog>().Add(log);
        await _context.SaveChangesAsync();

        return new ActivityLogDto
        {
            Id = log.Id,
            EntityType = log.EntityType,
            EntityId = log.EntityId,
            EntityName = log.EntityName,
            Action = log.Action,
            Details = log.Details,
            Timestamp = log.Timestamp
        };
    }

    // ==================== Resume Metadata ====================
    
    public async Task<List<ResumeMetadataDto>> GetUserResumesMetadataAsync(Guid userId)
    {
        var userIdString = userId.ToString();
        
        var resumes = await _context.Resumes
            .Include(r => r.Projects)
            .Include(r => r.WorkExperiences)
            .Where(r => r.UserId == userIdString)
            .ToListAsync();

        return resumes.Select(r => new ResumeMetadataDto
        {
            Id = r.Id,
            Title = r.Title,
            ResumeType = null, // Add if you have a ResumeType field
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt,
            IsPublic = r.IsPublic,
            ProjectCount = r.Projects.Count,
            WorkExperiences = r.WorkExperiences.Select(we => new WorkExperienceMetadataDto
            {
                Id = we.Id,
                Company = we.CompanyName,
                Position = we.JobTitle,
                StartDate = we.StartDate,
                EndDate = we.EndDate,
                IsCurrent = we.IsCurrent
            }).ToList()
        }).ToList();
    }

    public async Task<List<WorkExperienceMetadataDto>> GetResumeWorkExperiencesAsync(Guid userId, Guid resumeId)
    {
        var userIdString = userId.ToString();
        
        var resume = await _context.Resumes
            .Include(r => r.WorkExperiences)
            .FirstOrDefaultAsync(r => r.Id == resumeId && r.UserId == userIdString);

        if (resume == null) return new List<WorkExperienceMetadataDto>();

        return resume.WorkExperiences.Select(we => new WorkExperienceMetadataDto
        {
            Id = we.Id,
            Company = we.CompanyName,
            Position = we.JobTitle,
            StartDate = we.StartDate,
            EndDate = we.EndDate,
            IsCurrent = we.IsCurrent
        }).ToList();
    }
}
