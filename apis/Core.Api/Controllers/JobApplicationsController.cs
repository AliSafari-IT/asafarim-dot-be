using Core.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<JobApplicationsController> _logger;

    public JobApplicationsController(
        AppDbContext context,
        ILogger<JobApplicationsController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    // health check
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { status = "ok" , version = "1.0.0" , timestamp = DateTime.Now });
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAnalytics()
    {
        var applications = await _context
            .JobApplications.OrderByDescending(j => j.AppliedDate)
            .Select(j => new JobApplicationDto
            {
                Id = j.Id,
                Company = j.Company,
                Role = j.Role,
                Status = j.Status,
                AppliedDate = j.AppliedDate,
                Notes = j.Notes,
            })
            .ToListAsync();

        return Ok(applications);
    }
    
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JobApplicationDto>>> GetAll()
    {
        var applications = await _context
            .JobApplications.OrderByDescending(j => j.AppliedDate)
            .Select(j => new JobApplicationDto
            {
                Id = j.Id,
                Company = j.Company,
                Role = j.Role,
                Status = j.Status,
                AppliedDate = j.AppliedDate,
                Notes = j.Notes,
            })
            .ToListAsync();

        return Ok(applications);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobApplicationDto>> GetById(Guid id)
    {
        _logger.LogInformation(
            "GetById called with ID: {Id} from IP: {IP}, UserAgent: {UserAgent}, Path: {Path}",
            id,
            HttpContext.Connection.RemoteIpAddress,
            HttpContext.Request.Headers.UserAgent.ToString(),
            HttpContext.Request.Path
        );

        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
        {
            return NotFound();
        }

        var dto = new JobApplicationDto
        {
            Id = application.Id,
            Company = application.Company,
            Role = application.Role,
            Status = application.Status,
            AppliedDate = application.AppliedDate,
            Notes = application.Notes,
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<JobApplicationDto>> Create(JobApplicationDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Invalid model state when creating job application");
                return ValidationProblem(ModelState);
            }

            _logger.LogInformation(
                "Attempting to create job application for {Company}: {Role}",
                dto.Company,
                dto.Role
            );

            var application = new JobApplication
            {
                Id = Guid.NewGuid(),
                Company = dto.Company,
                Role = dto.Role,
                Status = dto.Status,
                AppliedDate = dto.AppliedDate,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
            };

            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();

            dto.Id = application.Id;

            _logger.LogInformation(
                "Successfully created job application for {Company}: {Role} with ID: {Id}",
                dto.Company,
                dto.Role,
                dto.Id
            );

            return CreatedAtAction(nameof(GetById), new { id = application.Id }, dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating job application: {Message}", ex.Message);
            return StatusCode(
                500,
                new { error = "Failed to create job application", details = ex.Message }
            );
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, JobApplicationDto dto)
    {
        if (id != dto.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
        {
            return NotFound();
        }

        application.Company = dto.Company;
        application.Role = dto.Role;
        application.Status = dto.Status;
        application.AppliedDate = dto.AppliedDate;
        application.Notes = dto.Notes;
        application.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!JobApplicationExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        _logger.LogInformation("Updated job application {Id} for {Company}", id, dto.Company);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var application = await _context.JobApplications.FindAsync(id);

        if (application == null)
        {
            return NotFound();
        }

        _context.JobApplications.Remove(application);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Deleted job application {Id} for {Company}",
            id,
            application.Company
        );

        return NoContent();
    }

    private bool JobApplicationExists(Guid id)
    {
        return _context.JobApplications.Any(e => e.Id == id);
    }
}
