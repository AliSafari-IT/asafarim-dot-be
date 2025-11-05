using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using TestAutomation.Api.Data;

namespace TestAutomation.Api.Controllers;

[ApiController]
[Route("api/results")]
[Authorize]
public class ResultsController : ControllerBase
{
    private readonly TestAutomationDbContext _db;

    public ResultsController(TestAutomationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] Guid? functionalRequirementId, [FromQuery] Guid? fixtureId, [FromQuery] Guid? suiteId, [FromQuery] Guid? testCaseId)
    {
        var q = _db.TestResults.AsQueryable();
        if (functionalRequirementId.HasValue) q = q.Where(r => r.FunctionalRequirementId == functionalRequirementId);
        if (fixtureId.HasValue) q = q.Where(r => r.FixtureId == fixtureId);
        if (suiteId.HasValue) q = q.Where(r => r.TestSuiteId == suiteId);
        if (testCaseId.HasValue) q = q.Where(r => r.TestCaseId == testCaseId);
        var results = await q.OrderByDescending(r => r.RunAt).Take(200).ToListAsync();
        return Ok(results);
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var result = await _db.TestResults.FindAsync(id);
        if (result == null || result.JsonReport == null) return NotFound();
        var json = result.JsonReport.RootElement.GetRawText();
        var fileName = $"result-{id}.json";
        return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", fileName);
    }
}