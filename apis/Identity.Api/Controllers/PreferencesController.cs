using System;
using System.Threading.Tasks;
using Identity.Api.Data;
using Identity.Api.DTOs;
using Identity.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("api/me")]
[Authorize]
public class PreferencesController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ILogger<PreferencesController> _logger;

    public PreferencesController(
        UserManager<AppUser> userManager,
        ILogger<PreferencesController> logger
    )
    {
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Get current user's preferences
    /// </summary>
    [HttpGet("preferences")]
    public async Task<ActionResult<UserPreferencesResponse>> GetPreferences()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(
            new UserPreferencesResponse { PreferredLanguage = user.PreferredLanguage ?? "en" }
        );
    }

    /// <summary>
    /// Update current user's preferences
    /// </summary>
    [HttpPost("preferences")]
    public async Task<ActionResult<UserPreferencesResponse>> UpdatePreferences(
        [FromBody] UserPreferencesDto preferences
    )
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User not authenticated" });
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.PreferredLanguage = preferences.PreferredLanguage;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            _logger.LogError("Failed to update user preferences for user {UserId}", userId);
            return StatusCode(500, new { message = "Failed to update preferences" });
        }

        // Set cookie for immediate use across subdomains
        SetLanguageCookie(preferences.PreferredLanguage);

        _logger.LogInformation(
            "Updated language preference to {Language} for user {UserId}",
            preferences.PreferredLanguage,
            userId
        );

        return Ok(new UserPreferencesResponse { PreferredLanguage = user.PreferredLanguage });
    }

    private void SetLanguageCookie(string language)
    {
        var cookieOptions = new Microsoft.AspNetCore.Http.CookieOptions
        {
            HttpOnly = false, // Allow JavaScript access
            Secure = true,
            SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddYears(1),
            Path = "/",
            Domain = ".asafarim.be", // Share across all subdomains
        };

        Response.Cookies.Append("preferredLanguage", language, cookieOptions);
    }
}
