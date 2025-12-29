using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class UsersController : ControllerBase
{
    private IActionResult? ValidateUserContext(out int userId, out bool isAdmin)
    {
        userId = 0;
        isAdmin = false;
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                return StatusCode(500, new { error = "Failed to sync user: " + errorObj });
            }
            return Unauthorized(new { error = "User context not available" });
        }

        userId = (int)userIdObj;
        isAdmin = User.IsInRole("admin");
        return null;
    }

    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        var validationError = ValidateUserContext(out var userId, out var isAdmin);
        if (validationError != null) return validationError;

        return Ok(new { userId, isAdmin });
    }
}
