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
[Route("api/tasks/{taskId}/comments")]
[Authorize]
public class TaskCommentsController : ControllerBase
{
    private readonly TaskManagementDbContext _context;
    private readonly IPermissionService _permissionService;

    public TaskCommentsController(
        TaskManagementDbContext context,
        IPermissionService permissionService
    )
    {
        _context = context;
        _permissionService = permissionService;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskCommentDto>>> GetTaskComments(Guid taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
            return NotFound();

        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanAccessProjectAsync(task.ProjectId, userId))
            return Forbid();

        var comments = await _context
            .TaskComments.Where(c => c.TaskId == taskId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new TaskCommentDto
            {
                Id = c.Id,
                TaskId = c.TaskId,
                UserId = c.UserId,
                Content = c.Content,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
            })
            .ToListAsync();

        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<TaskCommentDto>> CreateComment(
        Guid taskId,
        CreateTaskCommentDto dto
    )
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null)
            return NotFound();

        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (!await _permissionService.CanAccessProjectAsync(task.ProjectId, userId))
            return Forbid();

        var comment = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetTaskComments),
            new { taskId },
            new TaskCommentDto
            {
                Id = comment.Id,
                TaskId = comment.TaskId,
                UserId = comment.UserId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
            }
        );
    }

    [HttpPut("{commentId}")]
    public async Task<ActionResult<TaskCommentDto>> UpdateComment(
        Guid taskId,
        Guid commentId,
        UpdateTaskCommentDto dto
    )
    {
        var comment = await _context.TaskComments.FindAsync(commentId);
        if (comment == null || comment.TaskId != taskId)
            return NotFound();

        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (comment.UserId != userId)
            return Forbid();

        comment.Content = dto.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(
            new TaskCommentDto
            {
                Id = comment.Id,
                TaskId = comment.TaskId,
                UserId = comment.UserId,
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt,
            }
        );
    }

    [HttpDelete("{commentId}")]
    public async Task<IActionResult> DeleteComment(Guid taskId, Guid commentId)
    {
        var comment = await _context.TaskComments.FindAsync(commentId);
        if (comment == null || comment.TaskId != taskId)
            return NotFound();

        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            )?.Value;
        if (userId == null)
            return Unauthorized();

        if (comment.UserId != userId)
            return Forbid();

        _context.TaskComments.Remove(comment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
