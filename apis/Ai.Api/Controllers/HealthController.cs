using System;
using System.Reflection;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Shared.Logging;

namespace Ai.Api.Controllers
{
    [ApiController]
    [Route("health-check")]
    public class HealthController : ControllerBase
    {
        private static readonly string StartTime = DateTime.UtcNow.ToString("o");
        private static readonly string Version =
            Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";

        [HttpGet]
        [AllowAnonymous]
        public IActionResult Get()
        {
            var user = HttpContext.User;
            return Ok(
                new
                {
                    Status = "Healthy",
                    Service = "AI API",
                    User = user.Identity?.Name ?? "anonymous",
                    UserEmail = user.Identity?.Name ?? "anonymous",
                    UserId = user.Identity?.Name ?? "anonymous",
                    UserRoles = user.Identity?.Name ?? "anonymous",
                    UserClaims = user.Claims.Select(c => new { c.Type, c.Value }).ToList(),
                    UserIsAuthenticated = user.Identity?.IsAuthenticated ?? false,
                    UserIsInRole = user.IsInRole("Admin")
                        || user.IsInRole("admin")
                        || user.IsInRole("superadmin")
                        || user.IsInRole("SuperAdmin"),
                    Description = "This is a health check endpoint to test API connectivity",
                    Usage = "This endpoint is used to test API connectivity: https://asafarim.be/api/ai/health-check",
                    Version = Version,
                    Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                        ?? "Development",
                    StartTime = StartTime,
                    CurrentTime = DateTime.UtcNow.ToString("o"),
                }
            );
        }
    }
}
