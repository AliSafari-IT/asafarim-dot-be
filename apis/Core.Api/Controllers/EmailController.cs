using System.Security.Claims;
using Core.Api.Data;
using Core.Api.Models;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;

namespace Core.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EmailController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailController> _logger;
    private readonly CoreDbContext _context;

    public EmailController(
        IConfiguration configuration,
        ILogger<EmailController> logger,
        CoreDbContext context
    )
    {
        _configuration = configuration;
        _logger = logger;
        _context = context;
    }

    [HttpPost("send")]
    [AllowAnonymous]
    public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
    {
        try
        {
            // Validate configuration
            var fromAddress = _configuration["Smtp:From"];
            var toAddress = _configuration["Smtp:To"];

            if (string.IsNullOrEmpty(fromAddress) || string.IsNullOrEmpty(toAddress))
            {
                _logger.LogError("SMTP From or To address not configured");
                return BadRequest(new { success = false, error = "Email configuration error" });
            }

            // Validate request
            if (string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { success = false, error = "Sender email is required" });
            }

            var email = new MimeMessage();

            try
            {
                email.From.Add(MailboxAddress.Parse(fromAddress));
                email.To.Add(MailboxAddress.Parse(toAddress));
                email.ReplyTo.Add(MailboxAddress.Parse(request.Email));
                email.Subject = request.Subject;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Invalid email address format");
                return BadRequest(new { success = false, error = "Invalid email address format" });
            }

            var builder = new BodyBuilder();

            // Format the message body
            var messageBody = $"Message from: {request.Name} <{request.Email}>\n\n";
            if (!string.IsNullOrEmpty(request.ReferenceNumber))
            {
                messageBody += $"Reference Number: {request.ReferenceNumber}\n\n";
            }
            messageBody += request.Message;

            // Add links if any
            if (request.Links?.Any() == true)
            {
                messageBody += "\n\nLinks:\n";
                foreach (var link in request.Links)
                {
                    messageBody += $"- {link}\n";
                }
            }

            builder.TextBody = messageBody;

            // Add attachments if any
            if (request.Attachments?.Any() == true)
            {
                foreach (var attachment in request.Attachments)
                {
                    byte[] fileBytes = Convert.FromBase64String(attachment.Base64Content);
                    builder.Attachments.Add(
                        attachment.FileName,
                        fileBytes,
                        ContentType.Parse(attachment.ContentType)
                    );
                }
            }

            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            var host = _configuration["Smtp:Host"];
            var portStr = _configuration["Smtp:Port"];

            if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(portStr))
            {
                _logger.LogError("SMTP host or port not configured");
                return BadRequest(new { success = false, error = "Email configuration error" });
            }

            if (!int.TryParse(portStr, out var port))
            {
                _logger.LogError("Invalid SMTP port configuration");
                return BadRequest(new { success = false, error = "Email configuration error" });
            }

            var secure = _configuration.GetValue<bool>("Smtp:Secure");
            var secureOption = secure
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await smtp.ConnectAsync(host, port, secureOption);

            await smtp.AuthenticateAsync(
                _configuration["Smtp:User"],
                _configuration["Smtp:Password"]
            );

            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            // Get user ID from the token (if authenticated)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? contactId = null;

            // Store the contact in the database only if user is authenticated
            if (!string.IsNullOrEmpty(userId))
            {
                var contact = new Contact
                {
                    UserId = userId,
                    Email = request.Email,
                    Name = request.Name,
                    Subject = request.Subject,
                    Message = request.Message,
                    EmailSent = true,
                    AttachmentPath =
                        request.Attachments?.Any() == true
                            ? string.Join(", ", request.Attachments.Select(a => a.FileName))
                            : null,
                    ReferenceNumber = request.ReferenceNumber,
                    Links = request.Links?.Any() == true ? string.Join(", ", request.Links) : null,
                };

                _context.Contacts.Add(contact);
                await _context.SaveChangesAsync();
                contactId = contact.Id;
            }

            return Ok(
                new
                {
                    success = true,
                    message = "Email sent successfully",
                    contactId = contactId,
                    isAuthenticated = !string.IsNullOrEmpty(userId)
                }
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email");
            return BadRequest(new { success = false, error = ex.Message });
        }
    }

    [HttpGet("conversations")]
    public async Task<IActionResult> GetConversations()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { error = "User not authenticated" });
        }

        var conversations = await _context
            .Contacts.Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(conversations);
    }

    public class EmailRequest
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Subject { get; set; }
        public required string Message { get; set; }
        public string? ReferenceNumber { get; set; }
        public List<EmailAttachment>? Attachments { get; set; }
        public List<string>? Links { get; set; }
    }

    public class EmailAttachment
    {
        public required string FileName { get; set; }
        public required string ContentType { get; set; }
        public required string Base64Content { get; set; }
    }
}
