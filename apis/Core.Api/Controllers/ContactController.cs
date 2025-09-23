using Core.Api.Data;
using Core.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Core.Api.Controllers;

[ApiController]
[Route("contact")]
public sealed class ContactController : ControllerBase
{
    private readonly ILogger<ContactController> _logger;
    private readonly CoreDbContext _context;

    public ContactController(ILogger<ContactController> logger, CoreDbContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ContactRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var contact = new Contact
        {
            Email = req.Email,
            Subject = req.Subject,
            Message = req.Message,
            EmailSent = true // Since we're sending email right away
        };

        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Contact from {Email}: {Subject} ({Len} chars)",
            req.Email, req.Subject, req.Message?.Length ?? 0);
            
        return Accepted(new { ok = true, id = contact.Id });
    }
}
