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

    public async Task<List<ProjectDto>> GetUserProjectsAsync(string? userId)
    {
        var query = _db.Projects.AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(p => p.UserId == userId);
        else
            query = query.Where(p => p.UserId == null);

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
        if (dto.Assets != null)
            project.Assets = dto.Assets;
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
}
