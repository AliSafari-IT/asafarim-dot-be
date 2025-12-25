using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace TaskManagement.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendProjectInvitationAsync(string recipientEmail, string projectName, string inviterName, Guid invitationId)
    {
        try
        {
            var smtpHost = _configuration["Smtp:Host"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? "465");
            var smtpUser = _configuration["Smtp:User"] ?? "";
            var smtpPassword = _configuration["Smtp:Password"] ?? "";
            var smtpFrom = _configuration["Smtp:From"] ?? smtpUser;
            var smtpSecure = bool.Parse(_configuration["Smtp:Secure"] ?? "true");

            var baseUrl = _configuration["PasswordSetup:BaseUrl"] ?? "https://taskmanagement.asafarim.be";
            var identityUrl = "https://identity.asafarim.be";
            var acceptInvitationUrl = $"{baseUrl}/accept-invitation/{invitationId}";

            var subject = $"You've been invited to join '{projectName}'";
            var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #3A5AFE; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #3A5AFE; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>Project Invitation</h1>
        </div>
        <div class=""content"">
            <p>Hello,</p>
            <p><strong>{inviterName}</strong> has invited you to join the project <strong>'{projectName}'</strong> on TaskManagement.</p>
            
            <p><strong>To collaborate and add tasks, you need to create an account first.</strong></p>
            
            <h3>Next Steps:</h3>
            <ol>
                <li>Create your account at the Identity Portal</li>
                <li>Once registered, you'll automatically be added to the project</li>
                <li>Start collaborating with your team!</li>
            </ol>
            
            <p style=""text-align: center;"">
                <a href=""{identityUrl}/register?email={Uri.EscapeDataString(recipientEmail)}&returnUrl={Uri.EscapeDataString(acceptInvitationUrl)}"" class=""button"">Create Account & Join Project</a>
            </p>
            
            <p style=""font-size: 12px; color: #666; margin-top: 30px;"">
                If you already have an account, please <a href=""{identityUrl}/login?returnUrl={Uri.EscapeDataString(acceptInvitationUrl)}"">sign in here</a> to accept the invitation.
            </p>
        </div>
        <div class=""footer"">
            <p>This invitation was sent by {inviterName} via TaskManagement</p>
            <p>&copy; 2025 ASafariM. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
";

            using var message = new MailMessage
            {
                From = new MailAddress(smtpFrom),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(recipientEmail);

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = smtpSecure,
                Credentials = new NetworkCredential(smtpUser, smtpPassword)
            };

            await client.SendMailAsync(message);
            _logger.LogInformation("Invitation email sent to {Email} for project {ProjectName}", recipientEmail, projectName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send invitation email to {Email}", recipientEmail);
            throw;
        }
    }
}
