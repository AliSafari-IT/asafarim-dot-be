using Core.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.Controllers;

[ApiController]
[Route("contact")]
public sealed class ContactController : ControllerBase
{
    private readonly ILogger<ContactController> _logger;
    public ContactController(ILogger<ContactController> logger) => _logger = logger;

    [HttpPost]
    public IActionResult Post([FromBody] ContactRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        _logger.LogInformation("Contact from {Email}: {Subject} ({Len} chars)",
            req.Email, req.Subject, req.Message?.Length ?? 0);
        return Accepted(new { ok = true });
    }
}
