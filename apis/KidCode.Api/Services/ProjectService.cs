using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Services;

public class ProjectService : IProjectService
{
    private readonly KidCodeDbContext _db;

    public ProjectService(KidCodeDbContext db)
    {
        _db = db;
    }

    public async Task<List<ProjectDto>> GetUserProjectsAsync(
        string? userId,
        string? mode = null,
        bool? isDraft = null
    )
    {
        var query = _db.Projects.AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(p => p.UserId == userId);
        else
            query = query.Where(p => p.UserId == null);

        if (!string.IsNullOrEmpty(mode))
        {
            if (Enum.TryParse<ProjectMode>(mode, true, out var modeEnum))
                query = query.Where(p => p.Mode == modeEnum);
        }

        if (isDraft.HasValue)
            query = query.Where(p => p.IsDraft == isDraft.Value);

        return await query.OrderByDescending(p => p.UpdatedAt).Select(p => p.ToDto()).ToListAsync();
    }

    public async Task<ProjectDto?> GetProjectByIdAsync(Guid id, string? userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        return project?.ToDto();
    }

    public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, string? userId)
    {
        var project = dto.ToEntity(userId);
        _db.Projects.Add(project);
        await _db.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<ProjectDto?> UpdateProjectAsync(Guid id, UpdateProjectDto dto, string? userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        if (project == null)
            return null;

        if (dto.Title != null)
            project.Title = dto.Title;
        if (dto.BlocksJson != null)
            project.BlocksJson = dto.BlocksJson;
        if (dto.ModeDataJson != null)
            project.ModeDataJson = dto.ModeDataJson;
        if (dto.Assets != null)
            project.Assets = dto.Assets;
        if (dto.IsDraft.HasValue)
            project.IsDraft = dto.IsDraft.Value;
        project.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<bool> DeleteProjectAsync(Guid id, string? userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        if (project == null)
            return false;

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<ProjectDto?> RenameProjectAsync(Guid id, string newTitle, string? userId)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        if (project == null)
            return null;

        project.Title = newTitle;
        project.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<ProjectDto?> DuplicateProjectAsync(Guid id, string? newTitle, string? userId)
    {
        var original = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        if (original == null)
            return null;

        var duplicate = new Project
        {
            Id = Guid.NewGuid(),
            Title = newTitle ?? $"{original.Title} (Copy)",
            Mode = original.Mode,
            BlocksJson = original.BlocksJson,
            ModeDataJson = original.ModeDataJson,
            Assets = original.Assets,
            IsDraft = false,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Projects.Add(duplicate);
        await _db.SaveChangesAsync();
        return duplicate.ToDto();
    }

    public async Task<ProjectDto?> AutoSaveProjectAsync(
        Guid id,
        UpdateProjectDto dto,
        string? userId
    )
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p =>
            p.Id == id && (p.UserId == userId || p.UserId == null)
        );

        if (project == null)
            return null;

        if (dto.BlocksJson != null)
            project.BlocksJson = dto.BlocksJson;
        if (dto.ModeDataJson != null)
            project.ModeDataJson = dto.ModeDataJson;
        if (dto.Assets != null)
            project.Assets = dto.Assets;

        project.LastAutoSaveAt = DateTime.UtcNow;
        project.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return project.ToDto();
    }
}
