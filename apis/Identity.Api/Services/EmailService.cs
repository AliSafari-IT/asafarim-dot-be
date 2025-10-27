using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Identity.Api.Services;

/// <summary>
/// Service for sending emails
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send password setup magic link email
    /// </summary>
    Task SendPasswordSetupEmailAsync(string email, string magicLink);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _configuration;

    public EmailService(ILogger<EmailService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task SendPasswordSetupEmailAsync(string email, string magicLink)
    {
        try
        {
            // Validate SMTP configuration
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPortStr = _configuration["Smtp:Port"];
            var smtpUser = _configuration["Smtp:User"];
            var smtpPassword = _configuration["Smtp:Password"];
            var fromAddress = _configuration["Smtp:From"];

            if (
                string.IsNullOrEmpty(smtpHost)
                || string.IsNullOrEmpty(smtpPortStr)
                || string.IsNullOrEmpty(smtpUser)
                || string.IsNullOrEmpty(smtpPassword)
                || string.IsNullOrEmpty(fromAddress)
            )
            {
                _logger.LogWarning(
                    "SMTP configuration incomplete. Email not sent to {Email}",
                    email
                );
                _logger.LogInformation(
                    "📧 Password Setup Email (Logged) - To: {Email}, Magic Link: {Link}",
                    email,
                    magicLink
                );
                return;
            }

            if (!int.TryParse(smtpPortStr, out var smtpPort))
            {
                _logger.LogError("Invalid SMTP port configuration");
                return;
            }

            // Create email message
            var message = new MimeMessage();
            message.From.Add(MailboxAddress.Parse(fromAddress));
            message.To.Add(MailboxAddress.Parse(email));
            message.Subject = "Set Your Password - Asafarim";

            // Create HTML body
            var htmlContent =
                $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }}
        .button:hover {{ background: #764ba2; }}
        .footer {{ margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }}
        .link-text {{ word-break: break-all; font-size: 12px; color: #666; margin-top: 10px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Welcome to Asafarim</h1>
        </div>
        <div class='content'>
            <p>Hello,</p>
            <p>You've been invited to join Asafarim. Click the button below to set your password and get started:</p>
            <center>
                <a href='{magicLink}' class='button'>Set Your Password</a>
            </center>
            <p>Or copy and paste this link in your browser:</p>
            <div class='link-text'><a href='{magicLink}'>{magicLink}</a></div>
            <p style='color: #999; font-size: 12px;'>This link expires in 24 hours. If you didn't expect this email, you can safely ignore it.</p>
            <div class='footer'>
                <p>&copy; 2024 Asafarim. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>";

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlContent };
            message.Body = bodyBuilder.ToMessageBody();

            // Send email via SMTP
            using var smtp = new SmtpClient();
            var secure = _configuration.GetValue<bool>("Smtp:Secure");
            var secureOption = secure
                ? SecureSocketOptions.SslOnConnect
                : SecureSocketOptions.StartTls;

            await smtp.ConnectAsync(smtpHost, smtpPort, secureOption);
            await smtp.AuthenticateAsync(smtpUser, smtpPassword);
            await smtp.SendAsync(message);
            await smtp.DisconnectAsync(true);

            _logger.LogInformation("✅ Password setup email sent successfully to {Email}", email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error sending password setup email to {Email}", email);
            throw;
        }
    }
}
