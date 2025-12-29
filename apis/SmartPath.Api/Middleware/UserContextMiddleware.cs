using System.Security.Claims;
using SmartPath.Api.Services;

namespace SmartPath.Api.Middleware;

public class UserContextMiddleware
{
    private readonly RequestDelegate _next;

    public UserContextMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Try multiple claim types for user ID (sub is standard JWT, NameIdentifier is .NET)
            var identityUserId = context.User.FindFirst("sub")?.Value 
                ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(identityUserId))
            {
                try
                {
                    // Extract user info from JWT claims
                    var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
                    var name = context.User.FindFirst(ClaimTypes.Name)?.Value;

                    var localUser = await userService.GetOrCreateLocalUserAsync(identityUserId, email, name);
                    context.Items["UserId"] = localUser.UserId;
                    context.Items["IdentityUserId"] = identityUserId;
                }
                catch (Exception ex)
                {
                    context.Items["UserSyncError"] = ex.Message;
                }
            }
        }

        await _next(context);
    }
}
