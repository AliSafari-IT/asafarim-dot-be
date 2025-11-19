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
            
            // Shared Imports
            SharedImportsPath = dto.SharedImportsPath,
            SharedImportsContent = dto.SharedImportsContent,
            
            // Fixture Hooks
            BeforeHook = dto.BeforeHook,
            AfterHook = dto.AfterHook,
            BeforeEachHook = dto.BeforeEachHook,
            AfterEachHook = dto.AfterEachHook,
            
            // Authentication
            HttpAuthUsername = dto.HttpAuthUsername,
            HttpAuthPassword = dto.HttpAuthPassword,
            
            // Scripts and Hooks
            ClientScripts = dto.ClientScripts,
            RequestHooks = dto.RequestHooks,
            Metadata = dto.Metadata,
            SetupScript = dto.SetupScript,
            TeardownScript = dto.TeardownScript,
            
            // Audit fields
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            CreatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
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
            
        // Basic properties
        entity.Name = model.Name;
        entity.Description = model.Description;
        entity.PageUrl = model.PageUrl;
        
        // Shared Imports
        entity.SharedImportsPath = model.SharedImportsPath;
        entity.SharedImportsContent = model.SharedImportsContent;
        
        // Fixture Hooks
        entity.BeforeHook = model.BeforeHook;
        entity.AfterHook = model.AfterHook;
        entity.BeforeEachHook = model.BeforeEachHook;
        entity.AfterEachHook = model.AfterEachHook;
        
        // Authentication
        entity.HttpAuthUsername = model.HttpAuthUsername;
        entity.HttpAuthPassword = model.HttpAuthPassword;
        
        // Scripts and Hooks
        entity.ClientScripts = model.ClientScripts;
        entity.RequestHooks = model.RequestHooks;
        entity.Metadata = model.Metadata;
        entity.SetupScript = model.SetupScript;
        entity.TeardownScript = model.TeardownScript;
        
        // Audit fields
        entity.UpdatedAt = DateTime.UtcNow;
        entity.UpdatedById = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
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
