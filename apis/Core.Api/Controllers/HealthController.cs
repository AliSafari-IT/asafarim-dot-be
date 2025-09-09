using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Reflection;

namespace Core.Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HealthController : ControllerBase
    {
        private static readonly string StartTime = DateTime.UtcNow.ToString("o");
        private static readonly string Version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "1.0.0";
        
        [HttpGet]
        [AllowAnonymous]
        public IActionResult Get()
        {
            return Ok(new
            {
                Status = "Healthy",
                Service = "Core API",
                Version = Version,
                Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development",
                StartTime = StartTime,
                CurrentTime = DateTime.UtcNow.ToString("o")
            });
        }
    }
}
