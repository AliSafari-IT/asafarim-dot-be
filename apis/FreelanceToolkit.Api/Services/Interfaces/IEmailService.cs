namespace FreelanceToolkit.Api.Services.Interfaces;

public interface IEmailService
{
    Task SendProposalAsync(
        string proposalNumber,
        string title,
        string clientName,
        decimal totalAmount,
        DateTime? validUntil,
        byte[] pdfBytes,
        string recipientEmail
    );
    Task SendInvoiceAsync(
        string invoiceNumber,
        string clientName,
        decimal total,
        DateTime dueDate,
        string? notes,
        byte[] pdfBytes,
        string recipientEmail
    );
    Task SendBookingConfirmationAsync(
        string title,
        string clientName,
        DateTime startTime,
        DateTime endTime,
        string? location,
        string? meetingUrl,
        string? description,
        string recipientEmail
    );
    Task SendBookingReminderAsync(
        string title,
        string clientName,
        DateTime startTime,
        int durationMinutes,
        string? location,
        string? meetingUrl,
        string? description,
        string recipientEmail
    );

    // Auth related emails
    Task SendWelcomeEmailAsync(string email, string name);
    Task SendPasswordResetEmailAsync(string email, string resetLink);

    // Generic email
    Task SendEmailAsync(
        string to,
        string subject,
        string htmlBody,
        byte[]? attachment = null,
        string? attachmentName = null
    );

    // Custom email with plain text body
    Task SendCustomEmailAsync(
        string subject,
        string body,
        string recipientEmail,
        string recipientName,
        byte[] pdfBytes,
        string pdfFileName
    );
}
