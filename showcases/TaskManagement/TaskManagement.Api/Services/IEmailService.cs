namespace TaskManagement.Api.Services;

public interface IEmailService
{
    Task SendProjectInvitationAsync(string recipientEmail, string projectName, string inviterName, Guid invitationId);
}
