using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Api.Data;
using TaskManagement.Api.DTOs;
using TaskManagement.Api.Models;
using TaskManagement.Api.Services;

namespace TaskManagement.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId}/members")]
[Authorize]
public class ProjectMembersController : ControllerBase
{
    private readonly TaskManagementDbContext _context;
    private readonly IPermissionService _permissionService;

    public ProjectMembersController(
        TaskManagementDbContext context,
        IPermissionService permissionService
    )
    {
        _context = context;
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProjectMemberDto>>> GetProjectMembers(Guid projectId)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanAccessProjectAsync(projectId, userId))
            return Forbid();

        var members = await _context
            .ProjectMembers.Where(m => m.ProjectId == projectId)
            .Select(m => new ProjectMemberDto
            {
                Id = m.Id,
                ProjectId = m.ProjectId,
                UserId = m.UserId,
                Role = m.Role,
                JoinedAt = m.JoinedAt,
            })
            .ToListAsync();

        return Ok(members);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectMemberDto>> AddProjectMember(
        Guid projectId,
        AddProjectMemberDto dto
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanManageProjectMembersAsync(projectId, userId))
            return Forbid();

        // Check if member already exists
        var existingMember = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == projectId && m.UserId == dto.UserId
        );

        if (existingMember != null)
            return BadRequest("User is already a member of this project");

        var member = new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = dto.UserId,
            Role = dto.Role,
            JoinedAt = DateTime.UtcNow,
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProjectMembers),
            new { projectId },
            new ProjectMemberDto
            {
                Id = member.Id,
                ProjectId = member.ProjectId,
                UserId = member.UserId,
                Role = member.Role,
                JoinedAt = member.JoinedAt,
            }
        );
    }

    [HttpPut("{memberId}")]
    public async Task<ActionResult<ProjectMemberDto>> UpdateProjectMember(
        Guid projectId,
        Guid memberId,
        UpdateProjectMemberDto dto
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanManageProjectMembersAsync(projectId, userId))
            return Forbid();

        var member = await _context.ProjectMembers.FindAsync(memberId);
        if (member == null || member.ProjectId != projectId)
            return NotFound();

        member.Role = dto.Role;
        await _context.SaveChangesAsync();

        return Ok(
            new ProjectMemberDto
            {
                Id = member.Id,
                ProjectId = member.ProjectId,
                UserId = member.UserId,
                Role = member.Role,
                JoinedAt = member.JoinedAt,
            }
        );
    }

    [HttpPost("self")]
    public async Task<ActionResult<ProjectMemberDto>> AddMyselfToProject(
        Guid projectId,
        [FromBody] AddMyselfToProjectDto dto
    )
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        // Check if project exists
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null)
            return NotFound("Project not found");

        // Only project owner can add themselves (non-admins cannot self-join other projects)
        // Global admins can join any project
        var isGlobalAdmin = User.FindAll("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
            .Any(c => c.Value.Equals("admin", StringComparison.OrdinalIgnoreCase));

        if (!isGlobalAdmin && project.UserId != userId)
            return Forbid("Only project owners can join their own projects. Non-admins cannot join other projects.");

        // Check if already a member
        var existingMember = await _context.ProjectMembers.FirstOrDefaultAsync(m =>
            m.ProjectId == projectId && m.UserId == userId
        );

        if (existingMember != null)
            return BadRequest("You are already a member of this project");

        var member = new ProjectMember
        {
            Id = Guid.NewGuid(),
            ProjectId = projectId,
            UserId = userId,
            Role = dto.Role,
            JoinedAt = DateTime.UtcNow,
        };

        _context.ProjectMembers.Add(member);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetProjectMembers),
            new { projectId },
            new ProjectMemberDto
            {
                Id = member.Id,
                ProjectId = member.ProjectId,
                UserId = member.UserId,
                Role = member.Role,
                JoinedAt = member.JoinedAt,
            }
        );
    }

    [HttpDelete("{memberId}")]
    public async Task<IActionResult> RemoveProjectMember(Guid projectId, Guid memberId)
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanManageProjectMembersAsync(projectId, userId))
            return Forbid();

        var member = await _context.ProjectMembers.FindAsync(memberId);
        if (member == null || member.ProjectId != projectId)
            return NotFound();

        _context.ProjectMembers.Remove(member);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
