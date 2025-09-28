using System;
using System.Collections.Generic;

namespace Core.Api.Models;

public class PublicationDto
{
    public int Id { get; set; }
    
    // Basic content
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Meta { get; set; }
    public string? Description { get; set; }
    public string? Link { get; set; }
    
    // Media
    public string? ImageUrl { get; set; }
    public bool UseGradient { get; set; }
    public bool ShowImage { get; set; } = true;
    
    // Categorization
    public List<string>? Tags { get; set; }
    
    // Publication specific
    public string? Year { get; set; }
    public List<MetricDto>? Metrics { get; set; }
    
    // Display options
    public string Variant { get; set; } = "default";
    public string Size { get; set; } = "md";
    public bool FullWidth { get; set; }
    public bool Elevated { get; set; }
    public bool Bordered { get; set; } = true;
    public bool Clickable { get; set; }
    public bool Featured { get; set; }
    
    // Additional fields
    public string? DOI { get; set; }
    public string? JournalName { get; set; }
    public string? ConferenceName { get; set; }
    public string? PublicationType { get; set; }
    public string? UserId { get; set; }
}

public class MetricDto
{
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}

public class PublicationRequest
{
    // Basic content
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Meta { get; set; }
    public string? Description { get; set; }
    public string? Link { get; set; }
    
    // Media
    public string? ImageUrl { get; set; }
    public bool UseGradient { get; set; }
    public bool ShowImage { get; set; } = true;
    
    // Categorization
    public List<string>? Tags { get; set; }
    
    // Publication specific
    public string? Year { get; set; }
    public List<MetricDto>? Metrics { get; set; }
    
    // Display options
    public string Variant { get; set; } = "default";
    public string Size { get; set; } = "md";
    public bool FullWidth { get; set; }
    public bool Elevated { get; set; }
    public bool Bordered { get; set; } = true;
    public bool Clickable { get; set; }
    public bool Featured { get; set; }
    
    // Additional fields
    public string? DOI { get; set; }
    public string? JournalName { get; set; }
    public string? ConferenceName { get; set; }
    public string? PublicationType { get; set; }
    public int SortOrder { get; set; }
    public bool IsPublished { get; set; } = true;
}
