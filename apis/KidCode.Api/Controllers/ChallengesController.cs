using KidCode.Api.DTOs;
using KidCode.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChallengesController : ControllerBase
{
    private readonly IChallengeService _challengeService;

    public ChallengesController(IChallengeService challengeService)
    {
        _challengeService = challengeService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ChallengeDto>>> GetChallenges(
        [FromQuery] string? mode = null,
        [FromQuery] int? level = null)
    {
        var challenges = await _challengeService.GetChallengesAsync(mode, level);
        return Ok(challenges);
    }

    [HttpGet("daily")]
    public async Task<ActionResult<ChallengeDto>> GetDailyChallenge()
    {
        var challenge = await _challengeService.GetDailyChallengeAsync();
        if (challenge == null) return NotFound();
        return Ok(challenge);
    }
}
