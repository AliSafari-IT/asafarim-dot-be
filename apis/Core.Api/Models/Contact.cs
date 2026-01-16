using System.ComponentModel.DataAnnotations;
using Core.Api.Models.Common;

namespace Core.Api.Models;

public class Contact : BaseEntity
{
    public string? UserId { get; set; }

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(4000)]
    public string Message { get; set; } = string.Empty;

    public bool EmailSent { get; set; }

    public string? AttachmentPath { get; set; }

    public string? Name { get; set; }

    public string? ReferenceNumber { get; set; }

    public string? ReferingToConversation { get; set; }

    public string? Links { get; set; }
}
