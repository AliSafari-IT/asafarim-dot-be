using System.ComponentModel.DataAnnotations;

namespace KidCode.Api.Models;

public class CharacterAsset
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public Guid MediaAssetId { get; set; }

    public MediaAsset? MediaAsset { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
