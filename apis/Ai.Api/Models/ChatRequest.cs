using System.ComponentModel.DataAnnotations;

namespace Ai.Api.Models;

public sealed class ChatRequest
{
    [Required]
    public string Prompt { get; set; } = string.Empty;
}
