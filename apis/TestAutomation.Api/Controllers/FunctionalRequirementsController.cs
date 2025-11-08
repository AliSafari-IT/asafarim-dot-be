using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/functional-requirements")]
[Authorize]
public class FunctionalRequirementsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;
    private readonly ILogger<FunctionalRequirementsController> _logger;

    public FunctionalRequirementsController(
        TestAutomationDbContext db,
        ILogger<FunctionalRequirementsController> logger
    )
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("🚀 Fetching all functional requirements");
        var items = await _db.FunctionalRequirements.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] Guid id)
    {
        _logger.LogInformation("🚀 Fetching functional requirement by id: {Id}", id);
        var item = await _db.FunctionalRequirements.FindAsync(id);
        return item == null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] CreateFunctionalRequirementDto model)
    {
        _logger.LogInformation("🚀 Creating functional requirement: {@Model}", model);
        var entity = new FunctionalRequirement
        {
            Id = Guid.NewGuid(),
            Name = model.Name,
            Description = model.Description,
            ProjectName = model.ProjectName,
            IsActive = model.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
        };
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _db.FunctionalRequirements.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update(
        [FromRoute] Guid id,
        [FromBody] FunctionalRequirement model
    )
    {
        var entity = await _db.FunctionalRequirements.FindAsync(id);
        if (entity == null)
            return NotFound();
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.ProjectName = model.ProjectName;
        entity.IsActive = model.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var entity = await _db.FunctionalRequirements.FindAsync(id);
        if (entity == null)
            return NotFound();
        _db.FunctionalRequirements.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
