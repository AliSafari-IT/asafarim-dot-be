using System;
using System.Collections.Generic;
using System.Linq;

namespace TaskManagement.Api.Models;

public class ProjectMember
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ProjectRole Role { get; set; } = ProjectRole.Member;
    public DateTime JoinedAt { get; set; }

    // Navigation properties
    public TaskProject? Project { get; set; }
}
