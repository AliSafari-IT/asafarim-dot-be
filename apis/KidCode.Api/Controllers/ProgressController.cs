using System.Security.Claims;
using KidCode.Api.DTOs;
using KidCode.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProgressController : ControllerBase
{
    private readonly IProgressService _progressService;

    public ProgressController(IProgressService progressService)
    {
        _progressService = progressService;
    }

    private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "guest";

    [HttpGet]
    public async Task<ActionResult<ProgressDto>> GetProgress()
    {
        var progress = await _progressService.GetProgressAsync(GetUserId());
        return Ok(progress);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<ProgressDto>> GetUserProgress(string userId)
    {
        var progress = await _progressService.GetProgressAsync(userId);
        return Ok(progress);
    }

    [HttpPost("update")]
    public async Task<ActionResult<ProgressDto>> UpdateProgress([FromBody] UpdateProgressDto dto)
    {
        var progress = await _progressService.UpdateProgressAsync(GetUserId(), dto);
        return Ok(progress);
    }
}
