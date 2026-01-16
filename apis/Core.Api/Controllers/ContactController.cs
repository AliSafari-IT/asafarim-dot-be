using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.Controllers;

[ApiController]
[Route("contact")]
[EnableCors("frontend")]
public sealed class ContactController : ControllerBase
{
    private readonly ILogger<ContactController> _logger;
    private readonly CoreDbContext _context;

    public ContactController(ILogger<ContactController> logger, CoreDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    [EnableCors("frontend")]
    public IActionResult Get()
    {
        // Return a simple response indicating the contact endpoint is available
        return Ok(
            new
            {
                message = "Contact endpoint is available",
                methods = new[] { "POST" },
                description = "Send a POST request with email, subject, and message to submit a contact form",
            }
        );
    }

    [HttpPost]
    [EnableCors("frontend")]
    public async Task<IActionResult> Post([FromBody] ContactRequest req)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        var contact = new Contact
        {
            Email = req.Email,
            Subject = req.Subject,
            Message = req.Message,
            EmailSent = true, // Since we're sending email right away
        };

        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Contact from {Email}: {Subject} ({Len} chars)",
            req.Email,
            req.Subject,
            req.Message?.Length ?? 0
        );

        return Accepted(new { ok = true, id = contact.Id });
    }
}
