using System;
using System.Collections.Generic;

namespace Core.Api.Models;

public class TimelineAnalytics
{
    public int TotalApplications { get; set; }
    public double AverageTimeToOffer { get; set; } // in days
    public double SuccessRate { get; set; } // percentage
    public List<string> MostResponsiveCompanies { get; set; } = new();
    public double AverageResponseTime { get; set; } // in days
    public double InterviewSuccessRate { get; set; } // percentage
    public int TotalMilestones { get; set; }
    public int CompletedMilestones { get; set; }
    public double MilestoneCompletionRate { get; set; } // percentage
}

public class JobSearchInsights
{
    public Guid JobApplicationId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime AppliedDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public int DaysSinceApplication { get; set; }
    public int MilestonesCount { get; set; }
    public int CompletedMilestonesCount { get; set; }
    public double ProgressPercentage { get; set; }
    public DateTime? LastMilestoneDate { get; set; }
    public string? NextRecommendedAction { get; set; }
}

public class TimelineProgress
{
    public Guid JobApplicationId { get; set; }
    public string Company { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string CurrentStage { get; set; } = string.Empty;
    public double OverallProgress { get; set; } // percentage
    public DateTime LastUpdated { get; set; }
    public DateTime? NextReminder { get; set; }
    public List<TimelineStageProgress> StageProgress { get; set; } = new();
}

public class TimelineStageProgress
{
    public string StageName { get; set; } = string.Empty;
    public List<string> Milestones { get; set; } = new();
    public string Color { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public double Progress { get; set; } // percentage
}
