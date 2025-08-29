using System;
using System.ComponentModel.DataAnnotations;

namespace Core.Api.Models;

public class JobApplicationDto
{
    public Guid Id { get; set; }
    
    [Required, MaxLength(200)]
    public string Company { get; set; } = string.Empty;
    
    [Required, MaxLength(200)]
    public string Role { get; set; } = string.Empty;
    
    [Required, MaxLength(50)]
    public string Status { get; set; } = "Applied";
    
    [Required]
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
    
    [MaxLength(4000)]
    public string? Notes { get; set; }
}
