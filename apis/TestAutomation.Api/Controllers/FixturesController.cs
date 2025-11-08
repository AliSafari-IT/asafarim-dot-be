using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Data;
using TestAutomation.Api.DTOs;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/fixtures")]
[Authorize]
public class FixturesController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public FixturesController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] Guid? functionalRequirementId)
    {
        var q = _db.TestFixtures.AsQueryable();
        if (functionalRequirementId.HasValue)
            q = q.Where(f => f.FunctionalRequirementId == functionalRequirementId);
        var items = await q.AsNoTracking().ToListAsync();
        return Ok(items);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var entity = await _db.TestFixtures.FindAsync(id);
        return entity == null ? NotFound() : Ok(entity);
    }

    [HttpPost]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Create([FromBody] CreateFixtureDto dto)
    {
        var fixture = new TestFixture
        {
            Id = Guid.NewGuid(),
            FunctionalRequirementId = dto.FunctionalRequirementId,
            Name = dto.Name,
            Description = dto.Description,
            PageUrl = dto.PageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!),
        };

        _db.TestFixtures.Add(fixture);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = fixture.Id }, fixture);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFixtureDto model)
    {
        var entity = await _db.TestFixtures.FindAsync(id);
        if (entity == null)
            return NotFound();
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.PageUrl = model.PageUrl;
        entity.SetupScript = model.SetupScript;
        entity.TeardownScript = model.TeardownScript;
        entity.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TesterOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var entity = await _db.TestFixtures.FindAsync(id);
        if (entity == null)
            return NotFound();
        _db.TestFixtures.Remove(entity);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
