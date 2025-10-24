using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public UserController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserById(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return BadRequest("User ID is required");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound();

        return Ok(
            new
            {
                id = user.Id.ToString(),
                email = user.Email,
                userName = user.UserName,
            }
        );
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest req)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();
        var user = await _userManager.FindByIdAsync(sub);
        if (user is null)
            return Unauthorized();

        if (!string.IsNullOrWhiteSpace(req.Email))
            user.Email = req.Email;
        if (!string.IsNullOrWhiteSpace(req.UserName))
            user.UserName = req.UserName;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }

        var rolesNow = await _userManager.GetRolesAsync(user);
        return Ok(
            new MeResponse(user.Id.ToString(), user.Email, user.UserName, rolesNow.ToArray())
        );
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();
        if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword != req.ConfirmPassword)
        {
            ModelState.AddModelError("Password", "Passwords do not match");
            return ValidationProblem(ModelState);
        }

        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(sub))
            return Unauthorized();
        var user = await _userManager.FindByIdAsync(sub);
        if (user is null)
            return Unauthorized();

        var result = await _userManager.ChangePasswordAsync(
            user,
            req.CurrentPassword,
            req.NewPassword
        );
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }

        return Ok(new { message = "Password changed successfully" });
    }
}
