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
    Task SendInvoiceAsync(Guid invoiceId, string userId, string recipientEmail);
    Task SendBookingConfirmationAsync(Guid bookingId, string userId, string recipientEmail);
    Task SendBookingReminderAsync(Guid bookingId, string userId, string recipientEmail);

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
}
