using System.ComponentModel.DataAnnotations;

namespace Core.Api.Models;

public sealed class ContactRequest
{
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Subject { get; set; } = "Website Contact";

    [Required, MaxLength(4000)]
    public string Message { get; set; } = string.Empty;
}
