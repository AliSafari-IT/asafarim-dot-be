using FreelanceToolkit.Api.Services.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace FreelanceToolkit.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IInvoiceService _invoiceService;
    private readonly ICalendarService _calendarService;
    private readonly IPdfService _pdfService;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IConfiguration configuration,
        IInvoiceService invoiceService,
        ICalendarService calendarService,
        IPdfService pdfService,
        ILogger<EmailService> logger
    )
    {
        _configuration = configuration;
        _invoiceService = invoiceService;
        _calendarService = calendarService;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task SendProposalAsync(
        string proposalNumber,
        string title,
        string clientName,
        decimal totalAmount,
        DateTime? validUntil,
        byte[] pdfBytes,
        string recipientEmail
    )
    {
        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(clientName, recipientEmail));
        message.Subject = $"Proposal {proposalNumber} - {title}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>New Proposal: {title}</h2>
                    <p>Dear {clientName},</p>
                    <p>Please find attached your proposal <strong>{proposalNumber}</strong>.</p>
                    <p><strong>Total:</strong> ${totalAmount:N2}</p>
                    {(validUntil.HasValue ? $"<p><strong>Valid Until:</strong> {validUntil.Value:MMMM dd, yyyy}</p>" : "")}
                    <p>If you have any questions, please don't hesitate to contact us.</p>
                    <p>Best regards,<br/>ASafariM Digital</p>
                </body>
                </html>",
        };

        bodyBuilder.Attachments.Add(
            $"Proposal-{proposalNumber}.pdf",
            pdfBytes,
            new ContentType("application", "pdf")
        );
        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendInvoiceAsync(Guid invoiceId, string userId, string recipientEmail)
    {
        var invoice = await _invoiceService.GetByIdAsync(invoiceId, userId);
        var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(invoiceId, userId);

        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(invoice.ClientName, recipientEmail));
        message.Subject = $"Invoice {invoice.InvoiceNumber}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Invoice {invoice.InvoiceNumber}</h2>
                    <p>Dear {invoice.ClientName},</p>
                    <p>Please find attached your invoice.</p>
                    <p><strong>Amount Due:</strong> ${invoice.Total:N2}</p>
                    <p><strong>Due Date:</strong> {invoice.DueDate:MMMM dd, yyyy}</p>
                    {(!string.IsNullOrWhiteSpace(invoice.PaymentInstructions) ? $"<h3>Payment Instructions:</h3><p>{invoice.PaymentInstructions}</p>" : "")}
                    <p>Thank you for your business!</p>
                    <p>Best regards</p>
                </body>
                </html>",
        };

        bodyBuilder.Attachments.Add(
            $"Invoice-{invoice.InvoiceNumber}.pdf",
            pdfBytes,
            new ContentType("application", "pdf")
        );
        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendBookingConfirmationAsync(
        Guid bookingId,
        string userId,
        string recipientEmail
    )
    {
        var booking = await _calendarService.GetByIdAsync(bookingId, userId);

        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(booking.ClientName ?? "Client", recipientEmail));
        message.Subject = $"Meeting Confirmation: {booking.Title}";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Meeting Confirmation</h2>
                    <p>Dear {booking.ClientName ?? "Client"},</p>
                    <p>This is to confirm your upcoming meeting:</p>
                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date & Time:</strong> {booking.StartTime:MMMM dd, yyyy 'at' h:mm tt}</li>
                        <li><strong>Duration:</strong> {booking.DurationMinutes} minutes</li>
                        {(!string.IsNullOrWhiteSpace(booking.Location) ? $"<li><strong>Location:</strong> {booking.Location}</li>" : "")}
                        {(!string.IsNullOrWhiteSpace(booking.MeetingUrl) ? $"<li><strong>Meeting URL:</strong> <a href='{booking.MeetingUrl}'>{booking.MeetingUrl}</a></li>" : "")}
                    </ul>
                    {(!string.IsNullOrWhiteSpace(booking.Description) ? $"<p><strong>Description:</strong><br/>{booking.Description}</p>" : "")}
                    <p>Looking forward to meeting with you!</p>
                    <p>Best regards</p>
                </body>
                </html>",
        };

        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendBookingReminderAsync(Guid bookingId, string userId, string recipientEmail)
    {
        var booking = await _calendarService.GetByIdAsync(bookingId, userId);

        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(booking.ClientName ?? "Client", recipientEmail));
        message.Subject = $"Reminder: {booking.Title} - Tomorrow";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Meeting Reminder</h2>
                    <p>Dear {booking.ClientName ?? "Client"},</p>
                    <p>This is a friendly reminder about our upcoming meeting:</p>
                    <ul>
                        <li><strong>Title:</strong> {booking.Title}</li>
                        <li><strong>Date & Time:</strong> {booking.StartTime:MMMM dd, yyyy 'at' h:mm tt}</li>
                        <li><strong>Duration:</strong> {booking.DurationMinutes} minutes</li>
                        {(!string.IsNullOrWhiteSpace(booking.Location) ? $"<li><strong>Location:</strong> {booking.Location}</li>" : "")}
                        {(!string.IsNullOrWhiteSpace(booking.MeetingUrl) ? $"<li><strong>Meeting URL:</strong> <a href='{booking.MeetingUrl}'>{booking.MeetingUrl}</a></li>" : "")}
                    </ul>
                    <p>See you soon!</p>
                    <p>Best regards</p>
                </body>
                </html>",
        };

        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendWelcomeEmailAsync(string email, string name)
    {
        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(name, email));
        message.Subject = "Welcome to Freelance Toolkit";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Welcome to Freelance Toolkit!</h2>
                    <p>Dear {name},</p>
                    <p>Thank you for joining Freelance Toolkit. We're excited to help you manage your freelance business.</p>
                    <p>If you have any questions, feel free to reply to this email.</p>
                    <p>Best regards,<br/>The Freelance Toolkit Team</p>
                </body>
                </html>",
        };

        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendPasswordResetEmailAsync(string email, string resetLink)
    {
        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(email, email));
        message.Subject = "Reset Your Password";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody =
                $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the link below to set a new password:</p>
                    <p><a href='{resetLink}'>Reset Password</a></p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                    <p>Best regards,<br/>The Freelance Toolkit Team</p>
                </body>
                </html>",
        };

        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    public async Task SendEmailAsync(
        string to,
        string subject,
        string htmlBody,
        byte[]? attachment = null,
        string? attachmentName = null
    )
    {
        var message = new MimeMessage();
        message.From.Add(
            new MailboxAddress(
                _configuration["Email:FromName"] ?? "Freelance Toolkit",
                _configuration["Email:FromAddress"] ?? "noreply@example.com"
            )
        );
        message.To.Add(new MailboxAddress(to, to));
        message.Subject = subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };

        if (attachment != null && !string.IsNullOrEmpty(attachmentName))
        {
            bodyBuilder.Attachments.Add(attachmentName, attachment);
        }

        message.Body = bodyBuilder.ToMessageBody();

        await SendMimeMessageAsync(message);
    }

    private async Task SendMimeMessageAsync(MimeMessage message)
    {
        using var client = new SmtpClient();

        var smtpHost = _configuration["Email:SmtpHost"];
        var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
        var smtpUser = _configuration["Email:SmtpUser"];
        var smtpPassword = _configuration["Email:SmtpPassword"];
        var useSsl = bool.Parse(_configuration["Email:UseSsl"] ?? "true");

        _logger.LogInformation(
            "[EmailService] Email config - Host: {SmtpHost}, Port: {SmtpPort}, User: {SmtpUser}, SSL: {UseSsl}",
            smtpHost,
            smtpPort,
            smtpUser,
            useSsl
        );

        if (string.IsNullOrWhiteSpace(smtpHost))
        {
            // Email not configured, log and return
            _logger.LogWarning(
                "[EmailService] Email not configured. Would have sent: {Subject}",
                message.Subject
            );
            return;
        }

        try
        {
            _logger.LogInformation(
                "[EmailService] Connecting to SMTP server {SmtpHost}:{SmtpPort}",
                smtpHost,
                smtpPort
            );
            // Use SslOnConnect for port 465, StartTls for port 587
            var secureOption =
                smtpPort == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls;
            await client.ConnectAsync(
                smtpHost,
                smtpPort,
                useSsl ? secureOption : SecureSocketOptions.None
            );
            _logger.LogInformation("[EmailService] Connected to SMTP server");

            if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPassword))
            {
                _logger.LogInformation(
                    "[EmailService] Authenticating with user {SmtpUser}",
                    smtpUser
                );
                await client.AuthenticateAsync(smtpUser, smtpPassword);
                _logger.LogInformation("[EmailService] Authentication successful");
            }

            _logger.LogInformation(
                "[EmailService] Sending email to {To} with subject: {Subject}",
                message.To,
                message.Subject
            );
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation(
                "[EmailService] Email sent successfully: {Subject}",
                message.Subject
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[EmailService] Failed to send email: {ErrorMessage}", ex.Message);
            throw;
        }
    }
}
