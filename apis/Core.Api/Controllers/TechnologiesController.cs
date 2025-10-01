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
public class TechnologiesController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<TechnologiesController> _logger;

    public TechnologiesController(CoreDbContext context, ILogger<TechnologiesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/technologies
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TechnologyDto>>> GetTechnologies([FromQuery] string? category = null)
    {
        var query = _context.Technologies.AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(t => t.Category == category);
        }

        var technologies = await query
            .OrderBy(t => t.Category)
            .ThenBy(t => t.Name)
            .ToListAsync();

        return Ok(technologies.Select(MapToDto));
    }

    // GET: api/technologies/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<TechnologyDto>> GetTechnology(Guid id)
    {
        var technology = await _context.Technologies.FindAsync(id);

        if (technology == null)
        {
            return NotFound();
        }

        return Ok(MapToDto(technology));
    }

    // POST: api/technologies
    [HttpPost]
    [Authorize(Roles = "Admin")] // Only admins can create technologies
    public async Task<ActionResult<TechnologyDto>> CreateTechnology(CreateTechnologyRequest request)
    {
        // Check if technology already exists
        var existing = await _context.Technologies
            .FirstOrDefaultAsync(t => t.Name.ToLower() == request.Name.ToLower());

        if (existing != null)
        {
            return Conflict("Technology with this name already exists");
        }

        var technology = new Technology
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Category = request.Category
        };

        _context.Technologies.Add(technology);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTechnology), new { id = technology.Id }, MapToDto(technology));
    }

    // PUT: api/technologies/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTechnology(Guid id, UpdateTechnologyRequest request)
    {
        var technology = await _context.Technologies.FindAsync(id);

        if (technology == null)
        {
            return NotFound();
        }

        technology.Name = request.Name;
        technology.Category = request.Category;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/technologies/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTechnology(Guid id)
    {
        var technology = await _context.Technologies.FindAsync(id);

        if (technology == null)
        {
            return NotFound();
        }

        _context.Technologies.Remove(technology);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static TechnologyDto MapToDto(Technology technology)
    {
        return new TechnologyDto
        {
            Id = technology.Id,
            Name = technology.Name,
            Category = technology.Category
        };
    }
}

// TechnologyDto is now in Core.Api.Controllers.Resume.ResumeDtos.cs

public class CreateTechnologyRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class UpdateTechnologyRequest
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
