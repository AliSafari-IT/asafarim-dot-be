using System;
using System.Collections.Generic;

namespace Core.Api.Models;

public class Publication
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
    public List<PublicationMetric>? Metrics { get; set; }

    // Display options
    public string Variant { get; set; } = "default"; // project, article, publication, report, default
    public string Size { get; set; } = "md"; // sm, md, lg
    public bool FullWidth { get; set; }
    public bool Elevated { get; set; }
    public bool Bordered { get; set; } = true;
    public bool Clickable { get; set; }
    public bool Featured { get; set; }

    // Timestamps
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Additional fields for filtering and organization
    public string? AuthorId { get; set; }
    public string? UserId { get; set; } // ID of the user who created this publication
    public bool IsPublished { get; set; } = true;
    public int SortOrder { get; set; }
    public string? DOI { get; set; }
    public string? JournalName { get; set; }
    public string? ConferenceName { get; set; }
    public string? PublicationType { get; set; } // academic, blog, presentation, etc.
}

public class PublicationMetric
{
    public int Id { get; set; }
    public int PublicationId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;

    // Navigation property
    public Publication? Publication { get; set; }
}
