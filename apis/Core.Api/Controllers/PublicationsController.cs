using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PublicationsController : ControllerBase
{
    private readonly CoreDbContext _context;
    private readonly ILogger<PublicationsController> _logger;

    public PublicationsController(CoreDbContext context, ILogger<PublicationsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/publications
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublicationDto>>> GetPublications(
        [FromQuery] string? variant = null,
        [FromQuery] bool? featured = null,
        [FromQuery] bool? myPublications = null
    )
    {
        _logger.LogInformation(
            "Getting publications with variant: {Variant}, featured: {Featured}, myPublications: {MyPublications}",
            variant,
            featured,
            myPublications
        );

        var query = _context.Publications.Include(p => p.Metrics).AsQueryable();

        // Filter by current user if requested
        if (myPublications == true && User.Identity?.IsAuthenticated == true)
        {
            var userId =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst(
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                query = query.Where(p => p.UserId == userId);
            }
        }

        // Apply filters if provided
        if (!string.IsNullOrEmpty(variant))
        {
            query = query.Where(p => p.Variant == variant);
        }

        if (featured.HasValue)
        {
            query = query.Where(p => p.Featured == featured.Value);
        }

        // Only return published items
        query = query.Where(p => p.IsPublished);

        // Order by sort order and then by year descending
        query = query.OrderBy(p => p.SortOrder).ThenByDescending(p => p.Year);

        var publications = await query.ToListAsync();

        return Ok(publications.Select(p => MapToDto(p)));
    }

    // GET: api/publications/5
    [HttpGet("{id}")]
    public async Task<ActionResult<PublicationDto>> GetPublication(int id)
    {
        _logger.LogInformation("Getting publication with id: {Id}", id);

        var publication = await _context
            .Publications.Include(p => p.Metrics)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (publication == null)
        {
            return NotFound();
        }

        return MapToDto(publication);
    }

    // POST: api/publications
    [HttpPost]
    [Authorize] // Any authenticated user can create publications
    public async Task<ActionResult<PublicationDto>> CreatePublication(PublicationRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new publication: {Title}", request.Title);
            _logger.LogInformation("Request details: {@Request}", request);

            // Get the current user ID from the claims
            var userId =
                User.FindFirst("sub")?.Value
                ?? User.FindFirst(
                    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
                )?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var publication = new Publication
            {
                Title = request.Title,
                Subtitle = request.Subtitle,
                Meta = request.Meta,
                Description = request.Description,
                Link = request.Link,
                ImageUrl = request.ImageUrl,
                UseGradient = request.UseGradient,
                ShowImage = request.ShowImage,
                Tags = request.Tags,
                Year = request.Year,
                Variant = request.Variant,
                Size = request.Size,
                FullWidth = request.FullWidth,
                Elevated = request.Elevated,
                Bordered = request.Bordered,
                Clickable = request.Clickable,
                Featured = request.Featured,
                DOI = request.DOI,
                JournalName = request.JournalName,
                ConferenceName = request.ConferenceName,
                PublicationType = request.PublicationType,
                SortOrder = request.SortOrder,
                IsPublished = request.IsPublished,
                UserId = userId, // Set the user ID
                CreatedAt = DateTime.UtcNow,
            };

            _context.Publications.Add(publication);
            await _context.SaveChangesAsync();

            // Add metrics if provided
            if (request.Metrics != null && request.Metrics.Any())
            {
                foreach (var metric in request.Metrics)
                {
                    _context.PublicationMetrics.Add(
                        new PublicationMetric
                        {
                            PublicationId = publication.Id,
                            Label = metric.Label,
                            Value = metric.Value,
                        }
                    );
                }
                await _context.SaveChangesAsync();
            }

            // Reload the publication with metrics
            if (publication != null)
            {
                publication = await _context
                    .Publications.Include(p => p.Metrics)
                    .FirstOrDefaultAsync(p => p.Id == publication.Id);
            }

            return CreatedAtAction(
                nameof(GetPublication),
                new { id = publication?.Id ?? 0 },
                publication != null ? MapToDto(publication) : null
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating publication: {Message}", ex.Message);
            return StatusCode(
                500,
                "An error occurred while creating the publication. Please try again later."
            );
        }
    }

    // PUT: api/publications/5
    [HttpPut("{id}")]
    [Authorize] // Any authenticated user can update their own publications
    public async Task<IActionResult> UpdatePublication(int id, PublicationRequest request)
    {
        _logger.LogInformation("Updating publication with id: {Id}", id);

        // Get the current user ID from the claims
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var publication = await _context
            .Publications.Include(p => p.Metrics)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (publication == null)
        {
            return NotFound();
        }

        // Check if the user owns this publication or is an admin
        bool isAdmin = User.IsInRole("admin") || User.IsInRole("Admin");
        bool isAdminEdit =
            Request.Query.ContainsKey("isAdminEdit") || Request.Headers.ContainsKey("X-Admin-Edit");

        _logger.LogInformation(
            "Update permission check - UserId: {UserId}, PublicationUserId: {PublicationUserId}, IsAdmin: {IsAdmin}, IsAdminEdit: {IsAdminEdit}, doi: {Doi}, journalName: {JournalName}, conferenceName: {ConferenceName}",
            userId,
            publication.UserId,
            isAdmin,
            isAdminEdit,
            publication.DOI,
            publication.JournalName,
            publication.ConferenceName
        );

        if (publication.UserId != userId && !(isAdmin && isAdminEdit))
        {
            return Forbid("You do not have permission to update this publication");
        }

        // Update publication properties
        publication.Title = request.Title;
        publication.Subtitle = request.Subtitle;
        publication.Meta = request.Meta;
        publication.Description = request.Description;
        publication.Link = request.Link;
        publication.ImageUrl = request.ImageUrl;
        publication.UseGradient = request.UseGradient;
        publication.ShowImage = request.ShowImage;
        publication.Tags = request.Tags;
        publication.Year = request.Year;
        publication.Variant = request.Variant;
        publication.Size = request.Size;
        publication.FullWidth = request.FullWidth;
        publication.Elevated = request.Elevated;
        publication.Bordered = request.Bordered;
        publication.Clickable = request.Clickable;
        publication.Featured = request.Featured;
        publication.DOI = request.DOI;
        publication.JournalName = request.JournalName;
        publication.ConferenceName = request.ConferenceName;
        publication.PublicationType = request.PublicationType;
        publication.SortOrder = request.SortOrder;
        publication.IsPublished = request.IsPublished;
        publication.UpdatedAt = DateTime.UtcNow;

        // Update metrics
        if (request.Metrics != null)
        {
            // Remove existing metrics
            if (publication.Metrics != null && publication.Metrics.Any())
            {
                _context.PublicationMetrics.RemoveRange(publication.Metrics);
            }

            // Add new metrics
            foreach (var metric in request.Metrics)
            {
                _context.PublicationMetrics.Add(
                    new PublicationMetric
                    {
                        PublicationId = publication.Id,
                        Label = metric.Label,
                        Value = metric.Value,
                    }
                );
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/publications/5
    [HttpDelete("{id}")]
    [Authorize] // Any authenticated user can delete their own publications
    public async Task<IActionResult> DeletePublication(int id)
    {
        _logger.LogInformation("Deleting publication with id: {Id}", id);

        // Get the current user ID from the claims
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("User ID not found in token");
        }

        var publication = await _context.Publications.FindAsync(id);
        if (publication == null)
        {
            return NotFound();
        }

        // Check if the user owns this publication or is an admin
        bool isAdmin = User.IsInRole("admin") || User.IsInRole("Admin");
        bool isAdminEdit =
            Request.Query.ContainsKey("isAdminEdit") || Request.Headers.ContainsKey("X-Admin-Edit");

        _logger.LogInformation(
            "Delete permission check - UserId: {UserId}, PublicationUserId: {PublicationUserId}, IsAdmin: {IsAdmin}, IsAdminEdit: {IsAdminEdit}",
            userId,
            publication.UserId,
            isAdmin,
            isAdminEdit
        );

        if (publication.UserId != userId && !(isAdmin && isAdminEdit))
        {
            return Forbid("You do not have permission to delete this publication");
        }

        _context.Publications.Remove(publication);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static PublicationDto MapToDto(Publication publication)
    {
        return new PublicationDto
        {
            Id = publication.Id,
            Title = publication.Title,
            Subtitle = publication.Subtitle,
            Meta = publication.Meta,
            Description = publication.Description,
            Link = publication.Link,
            ImageUrl = publication.ImageUrl,
            UseGradient = publication.UseGradient,
            ShowImage = publication.ShowImage,
            Tags = publication.Tags,
            Year = publication.Year,
            Metrics = publication
                .Metrics?.Select(m => new MetricDto { Label = m.Label, Value = m.Value })
                .ToList(),
            Variant = publication.Variant,
            Size = publication.Size,
            FullWidth = publication.FullWidth,
            Elevated = publication.Elevated,
            Bordered = publication.Bordered,
            Clickable = publication.Clickable,
            Featured = publication.Featured,
            DOI = publication.DOI,
            JournalName = publication.JournalName,
            ConferenceName = publication.ConferenceName,
            PublicationType = publication.PublicationType,
            UserId = publication.UserId,
        };
    }
}
