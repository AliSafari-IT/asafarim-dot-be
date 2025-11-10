using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace TestAutomation.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CredentialType
{
    ApiKey,
    Token,
    Password,
    Certificate,
}

public class UserCredential
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public CredentialType Type { get; set; }

    /// <summary>
    /// Encrypted credential value
    /// </summary>
    [Required]
    public string EncryptedValue { get; set; } = string.Empty;

    public DateTime? LastUsed { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
