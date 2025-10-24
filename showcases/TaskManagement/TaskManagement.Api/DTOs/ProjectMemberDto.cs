using TaskManagement.Api.Models;

namespace TaskManagement.Api.DTOs;

public class ProjectMemberDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public ProjectRole Role { get; set; }
    public DateTime JoinedAt { get; set; }
}

public class AddProjectMemberDto
{
    public string UserId { get; set; } = string.Empty;
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}

public class UpdateProjectMemberDto
{
    public ProjectRole Role { get; set; }
}

public class AddMyselfToProjectDto
{
    public ProjectRole Role { get; set; } = ProjectRole.Member;
}
