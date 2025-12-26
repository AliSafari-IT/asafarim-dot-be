using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TimelineMilestonesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<TimelineMilestonesController> _logger;

    public TimelineMilestonesController(
        AppDbContext context,
        ILogger<TimelineMilestonesController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/TimelineMilestones/job/{jobId}
    [HttpGet("job/{jobId}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<TimelineMilestoneDto>>> GetMilestonesByJob(
        Guid jobId
    )
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            // Verify the job belongs to the user
            var jobBelongsToUser = await _context.JobApplications
                .AnyAsync(j => j.Id == jobId && j.UserId == userId);
            
            if (!jobBelongsToUser)
            {
                return NotFound();
            }

            var milestones = await _context
                .TimelineMilestones.Where(t => t.JobApplicationId == jobId)
                .OrderBy(t => t.Date)
                .Select(t => new TimelineMilestoneDto
                {
                    Id = t.Id,
                    JobApplicationId = t.JobApplicationId,
                    Type = t.Type,
                    Title = t.Title,
                    Description = t.Description,
                    Date = t.Date,
                    Status = t.Status,
                    Notes = t.Notes,
                    Attachments = t.Attachments,
                    ReminderDate = t.ReminderDate,
                    IsCompleted = t.IsCompleted,
                    CompletedDate = t.CompletedDate,
                    Color = t.Color,
                    Icon = t.Icon,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                })
                .ToListAsync();

            return Ok(milestones);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching milestones for job {JobId}", jobId);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/TimelineMilestones/{id}
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<TimelineMilestoneDto>> GetMilestone(Guid id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var milestone = await _context
                .TimelineMilestones
                .Include(t => t.JobApplication)
                .Where(t => t.Id == id && t.JobApplication.UserId == userId)
                .Select(t => new TimelineMilestoneDto
                {
                    Id = t.Id,
                    JobApplicationId = t.JobApplicationId,
                    Type = t.Type,
                    Title = t.Title,
                    Description = t.Description,
                    Date = t.Date,
                    Status = t.Status,
                    Notes = t.Notes,
                    Attachments = t.Attachments,
                    ReminderDate = t.ReminderDate,
                    IsCompleted = t.IsCompleted,
                    CompletedDate = t.CompletedDate,
                    Color = t.Color,
                    Icon = t.Icon,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                })
                .FirstOrDefaultAsync();

            if (milestone == null)
            {
                return NotFound();
            }

            return Ok(milestone);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching milestone {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // POST: api/TimelineMilestones
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<TimelineMilestoneDto>> CreateMilestone(
        [FromBody] CreateTimelineMilestoneDto createDto
    )
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            // Verify the job application exists and belongs to the user
            var jobBelongsToUser = await _context.JobApplications
                .AnyAsync(j => j.Id == createDto.JobApplicationId && j.UserId == userId);
            
            if (!jobBelongsToUser)
            {
                return BadRequest("Job application not found or access denied");
            }

            var milestone = new TimelineMilestone
            {
                Id = Guid.NewGuid(),
                JobApplicationId = createDto.JobApplicationId,
                Type = createDto.Type,
                Title = createDto.Title,
                Description = createDto.Description,
                Date = createDto.Date,
                Status = createDto.Status,
                Notes = createDto.Notes,
                Attachments = createDto.Attachments,
                ReminderDate = createDto.ReminderDate,
                IsCompleted = false,
                Color = createDto.Color,
                Icon = createDto.Icon,
                CreatedAt = DateTime.UtcNow,
            };

            _context.TimelineMilestones.Add(milestone);
            await _context.SaveChangesAsync();

            // Update the job application's UpdatedAt timestamp
            var job = await _context.JobApplications.FindAsync(createDto.JobApplicationId);
            if (job != null)
            {
                job.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            var resultDto = new TimelineMilestoneDto
            {
                Id = milestone.Id,
                JobApplicationId = milestone.JobApplicationId,
                Type = milestone.Type,
                Title = milestone.Title,
                Description = milestone.Description,
                Date = milestone.Date,
                Status = milestone.Status,
                Notes = milestone.Notes,
                Attachments = milestone.Attachments,
                ReminderDate = milestone.ReminderDate,
                IsCompleted = milestone.IsCompleted,
                CompletedDate = milestone.CompletedDate,
                Color = milestone.Color,
                Icon = milestone.Icon,
                CreatedAt = milestone.CreatedAt,
                UpdatedAt = milestone.UpdatedAt,
            };

            return CreatedAtAction(nameof(GetMilestone), new { id = milestone.Id }, resultDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating milestone");
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/TimelineMilestones/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateMilestone(Guid id, [FromBody] UpdateTimelineMilestoneDto updateDto)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var milestone = await _context.TimelineMilestones
                .Include(t => t.JobApplication)
                .Where(t => t.Id == id && t.JobApplication.UserId == userId)
                .FirstOrDefaultAsync();
            
            if (milestone == null)
            {
                return NotFound();
            }

            milestone.Title = updateDto.Title;
            milestone.Description = updateDto.Description;
            milestone.Date = updateDto.Date;
            milestone.Status = updateDto.Status;
            milestone.Notes = updateDto.Notes;
            milestone.Attachments = updateDto.Attachments;
            milestone.ReminderDate = updateDto.ReminderDate;
            milestone.IsCompleted = updateDto.IsCompleted;
            milestone.CompletedDate = updateDto.IsCompleted ? DateTime.UtcNow : null;
            milestone.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Update the job application's UpdatedAt timestamp
            var job = await _context.JobApplications.FindAsync(milestone.JobApplicationId);
            if (job != null)
            {
                job.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating milestone {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // DELETE: api/TimelineMilestones/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteMilestone(Guid id)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var milestone = await _context.TimelineMilestones
                .Include(t => t.JobApplication)
                .Where(t => t.Id == id && t.JobApplication.UserId == userId)
                .FirstOrDefaultAsync();
            
            if (milestone == null)
            {
                return NotFound();
            }

            _context.TimelineMilestones.Remove(milestone);
            await _context.SaveChangesAsync();

            // Update the job application's UpdatedAt timestamp
            var job = await _context.JobApplications.FindAsync(milestone.JobApplicationId);
            if (job != null)
            {
                job.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting milestone {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/TimelineMilestones/analytics
    [HttpGet("analytics")]
    [Authorize]
    public async Task<ActionResult<TimelineAnalytics>> GetAnalytics()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var totalApplications = await _context.JobApplications
                .Where(j => j.UserId == userId)
                .CountAsync();
            
            var totalMilestones = await _context.TimelineMilestones
                .Where(m => m.JobApplication.UserId == userId)
                .CountAsync();
            
            var completedMilestones = await _context.TimelineMilestones
                .Where(m => m.JobApplication.UserId == userId && m.IsCompleted)
                .CountAsync();

            // Calculate success rate (jobs with status "Offer" or "Accepted")
            var successfulJobs = await _context.JobApplications
                .Where(j => j.UserId == userId && (j.Status == "Offer" || j.Status == "Accepted"))
                .CountAsync();
            var successRate =
                totalApplications > 0 ? (double)successfulJobs / totalApplications * 100 : 0;

            // Calculate average time to offer
            var offerJobs = await _context
                .JobApplications
                .Where(j => j.UserId == userId && (j.Status == "Offer" || j.Status == "Accepted"))
                .ToListAsync();

            double averageTimeToOffer = 0;
            if (offerJobs.Any())
            {
                var totalDays = offerJobs.Sum(j =>
                    (j.UpdatedAt ?? j.CreatedAt).Subtract(j.AppliedDate).TotalDays
                );
                averageTimeToOffer = totalDays / offerJobs.Count;
            }

            // Calculate milestone completion rate
            var milestoneCompletionRate =
                totalMilestones > 0 ? (double)completedMilestones / totalMilestones * 100 : 0;

            // Get most responsive companies (companies with most milestones)
            var mostResponsiveCompanies = await _context
                .TimelineMilestones
                .Where(t => t.JobApplication.UserId == userId)
                .GroupBy(t => t.JobApplicationId)
                .Select(g => new { JobId = g.Key, MilestoneCount = g.Count() })
                .OrderByDescending(x => x.MilestoneCount)
                .Take(5)
                .Join(
                    _context.JobApplications.Where(j => j.UserId == userId),
                    milestone => milestone.JobId,
                    job => job.Id,
                    (milestone, job) => job.Company
                )
                .Distinct()
                .ToListAsync();

            // Get top cities where user applied most
            var topCities = await _context
                .JobApplications
                .Where(j => j.UserId == userId && !string.IsNullOrEmpty(j.City))
                .GroupBy(j => j.City)
                .Select(g => new CityStatistic
                {
                    City = g.Key!,
                    ApplicationCount = g.Count()
                })
                .OrderByDescending(c => c.ApplicationCount)
                .Take(3)
                .ToListAsync();

            var analytics = new TimelineAnalytics
            {
                TotalApplications = totalApplications,
                AverageTimeToOffer = Math.Round(averageTimeToOffer, 1),
                SuccessRate = Math.Round(successRate, 1),
                MostResponsiveCompanies = mostResponsiveCompanies,
                TopCities = topCities,
                AverageResponseTime = 0, // TODO: Implement based on milestone dates
                InterviewSuccessRate = 0, // TODO: Implement based on interview milestones
                TotalMilestones = totalMilestones,
                CompletedMilestones = completedMilestones,
                MilestoneCompletionRate = Math.Round(milestoneCompletionRate, 1),
            };

            return Ok(analytics);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching analytics");
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/TimelineMilestones/progress/{jobId}
    [HttpGet("progress/{jobId}")]
    [Authorize]
    public async Task<ActionResult<TimelineProgress>> GetJobProgress(Guid jobId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var job = await _context.JobApplications.FindAsync(jobId);
            if (job == null)
            {
                return NotFound("Job application not found");
            }

            // Verify the job belongs to the authenticated user
            if (job.UserId != userId)
            {
                return Forbid();
            }

            var milestones = await _context
                .TimelineMilestones.Where(t => t.JobApplicationId == jobId)
                .OrderBy(t => t.Date)
                .ToListAsync();

            // Define timeline stages
            var stages = new List<TimelineStageProgress>
            {
                new TimelineStageProgress
                {
                    StageName = "Application",
                    Milestones = new List<string> { "resume_sent" },
                    Color = "#3b82f6",
                    Description = "Initial application submitted",
                    IsCompleted = milestones.Any(m => m.Type == "resume_sent" && m.IsCompleted),
                    Progress = milestones.Any(m => m.Type == "resume_sent" && m.IsCompleted)
                        ? 100
                        : 0,
                },
                new TimelineStageProgress
                {
                    StageName = "Screening",
                    Milestones = new List<string>
                    {
                        "phone_screen_scheduled",
                        "phone_screen_completed",
                    },
                    Color = "#8b5cf6",
                    Description = "Phone screening phase",
                    IsCompleted = milestones.Any(m =>
                        m.Type == "phone_screen_completed" && m.IsCompleted
                    ),
                    Progress = CalculateStageProgress(
                        milestones,
                        new List<string> { "phone_screen_scheduled", "phone_screen_completed" }
                    ),
                },
                new TimelineStageProgress
                {
                    StageName = "Interview",
                    Milestones = new List<string> { "interview_scheduled", "interview_completed" },
                    Color = "#f59e0b",
                    Description = "Main interview process",
                    IsCompleted = milestones.Any(m =>
                        m.Type == "interview_completed" && m.IsCompleted
                    ),
                    Progress = CalculateStageProgress(
                        milestones,
                        new List<string> { "interview_scheduled", "interview_completed" }
                    ),
                },
                new TimelineStageProgress
                {
                    StageName = "Follow-up",
                    Milestones = new List<string> { "follow_up_sent", "feedback_received" },
                    Color = "#10b981",
                    Description = "Post-interview communication",
                    IsCompleted = milestones.Any(m =>
                        m.Type == "feedback_received" && m.IsCompleted
                    ),
                    Progress = CalculateStageProgress(
                        milestones,
                        new List<string> { "follow_up_sent", "feedback_received" }
                    ),
                },
                new TimelineStageProgress
                {
                    StageName = "Offer",
                    Milestones = new List<string>
                    {
                        "offer_negotiation_started",
                        "offer_received",
                        "offer_accepted",
                        "offer_declined",
                    },
                    Color = "#ef4444",
                    Description = "Offer and negotiation",
                    IsCompleted = milestones.Any(m =>
                        new List<string> { "offer_accepted", "offer_declined" }.Contains(m.Type)
                        && m.IsCompleted
                    ),
                    Progress = CalculateStageProgress(
                        milestones,
                        new List<string>
                        {
                            "offer_negotiation_started",
                            "offer_received",
                            "offer_accepted",
                            "offer_declined",
                        }
                    ),
                },
            };

            var overallProgress = stages.Count > 0 ? stages.Average(s => s.Progress) : 0;
            var lastMilestone = milestones.OrderByDescending(m => m.Date).FirstOrDefault();
            var nextReminder = milestones
                .Where(m => m.ReminderDate > DateTime.UtcNow)
                .OrderBy(m => m.ReminderDate)
                .FirstOrDefault()
                ?.ReminderDate;

            var progress = new TimelineProgress
            {
                JobApplicationId = jobId,
                Company = job.Company,
                Role = job.Role,
                CurrentStage = DetermineCurrentStage(stages),
                OverallProgress = Math.Round(overallProgress, 1),
                LastUpdated =
                    lastMilestone?.UpdatedAt
                    ?? lastMilestone?.CreatedAt
                    ?? job.UpdatedAt
                    ?? job.CreatedAt,
                NextReminder = nextReminder,
                StageProgress = stages,
            };

            return Ok(progress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching progress for job {JobId}", jobId);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/TimelineMilestones/insights
    [HttpGet("insights")]
    [Authorize]
    public async Task<ActionResult<List<JobSearchInsights>>> GetJobSearchInsights()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var insights = new List<JobSearchInsights>();

            var jobs = await _context.JobApplications.Where(j => j.UserId == userId).ToListAsync();
            foreach (var job in jobs)
            {
                var milestones = await _context
                    .TimelineMilestones.Where(t => t.JobApplicationId == job.Id)
                    .ToListAsync();

                var daysSinceApplication = (DateTime.UtcNow - job.AppliedDate).Days;
                var milestonesCount = milestones.Count;
                var completedMilestonesCount = milestones.Count(m => m.IsCompleted);
                var progressPercentage =
                    milestonesCount > 0
                        ? (double)completedMilestonesCount / milestonesCount * 100
                        : 0;
                var lastMilestoneDate = milestones.Any()
                    ? milestones.Max(m => m.Date)
                    : (DateTime?)null;

                var nextRecommendedAction = DetermineNextAction(job.Status, milestones);

                insights.Add(
                    new JobSearchInsights
                    {
                        JobApplicationId = job.Id,
                        Company = job.Company,
                        Role = job.Role,
                        AppliedDate = job.AppliedDate,
                        Status = job.Status,
                        DaysSinceApplication = daysSinceApplication,
                        MilestonesCount = milestonesCount,
                        CompletedMilestonesCount = completedMilestonesCount,
                        ProgressPercentage = Math.Round(progressPercentage, 1),
                        LastMilestoneDate = lastMilestoneDate,
                        NextRecommendedAction = nextRecommendedAction,
                    }
                );
            }

            return Ok(insights.OrderByDescending(i => i.DaysSinceApplication));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching job search insights");
            return StatusCode(500, "Internal server error");
        }
    }

    private static double CalculateStageProgress(
        List<TimelineMilestone> milestones,
        List<string> stageMilestoneTypes
    )
    {
        var stageMilestones = milestones.Where(m => stageMilestoneTypes.Contains(m.Type)).ToList();
        if (!stageMilestones.Any())
            return 0;

        var completedCount = stageMilestones.Count(m => m.IsCompleted);
        return Math.Round((double)completedCount / stageMilestones.Count * 100, 1);
    }

    private static string DetermineCurrentStage(List<TimelineStageProgress> stages)
    {
        var currentStage = stages.FirstOrDefault(s => !s.IsCompleted);
        return currentStage?.StageName ?? "Completed";
    }

    private static string? DetermineNextAction(string status, List<TimelineMilestone> milestones)
    {
        return status switch
        {
            "Applied" => "Follow up on application",
            "Interview" => "Prepare for interview",
            "Offer" => "Review and negotiate offer",
            "Rejected" => "Request feedback for improvement",
            _ => "Update application status",
        };
    }
}
