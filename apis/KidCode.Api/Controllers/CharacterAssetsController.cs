using KidCode.Api.Data;
using KidCode.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CharacterAssetsController : ControllerBase
{
    private readonly KidCodeDbContext _context;
    private readonly ILogger<CharacterAssetsController> _logger;

    public CharacterAssetsController(
        KidCodeDbContext context,
        ILogger<CharacterAssetsController> logger
    )
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CharacterAssetDto>>> GetCharacterAssets()
    {
        var characters = await _context
            .CharacterAssets.Include(c => c.MediaAsset)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        var dtos = characters.Select(c => new CharacterAssetDto
        {
            Id = c.Id,
            Name = c.Name,
            MediaAssetId = c.MediaAssetId,
            Description = c.Description,
            CreatedAt = c.CreatedAt,
        });

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterAssetDto>> GetCharacterAsset(Guid id)
    {
        var character = await _context
            .CharacterAssets.Include(c => c.MediaAsset)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (character == null)
        {
            return NotFound();
        }

        var dto = new CharacterAssetDto
        {
            Id = character.Id,
            Name = character.Name,
            MediaAssetId = character.MediaAssetId,
            Description = character.Description,
            CreatedAt = character.CreatedAt,
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<CharacterAssetDto>> CreateCharacterAsset(
        CreateCharacterAssetDto dto
    )
    {
        var mediaAsset = await _context.MediaAssets.FindAsync(dto.MediaAssetId);
        if (mediaAsset == null)
        {
            return BadRequest("MediaAsset not found");
        }

        if (!mediaAsset.ContentType.StartsWith("image/"))
        {
            return BadRequest("MediaAsset must be an image");
        }

        var character = new CharacterAsset
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            MediaAssetId = dto.MediaAssetId,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _context.CharacterAssets.Add(character);
        await _context.SaveChangesAsync();

        var resultDto = new CharacterAssetDto
        {
            Id = character.Id,
            Name = character.Name,
            MediaAssetId = character.MediaAssetId,
            Description = character.Description,
            CreatedAt = character.CreatedAt,
        };

        return CreatedAtAction(nameof(GetCharacterAsset), new { id = character.Id }, resultDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCharacterAsset(Guid id, UpdateCharacterAssetDto dto)
    {
        var character = await _context.CharacterAssets.FindAsync(id);
        if (character == null)
        {
            return NotFound();
        }

        character.Name = dto.Name;
        character.Description = dto.Description;
        character.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCharacterAsset(Guid id)
    {
        var character = await _context.CharacterAssets.FindAsync(id);
        if (character == null)
        {
            return NotFound();
        }

        _context.CharacterAssets.Remove(character);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public record CharacterAssetDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public Guid MediaAssetId { get; init; }
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateCharacterAssetDto
{
    public string Name { get; init; } = string.Empty;
    public Guid MediaAssetId { get; init; }
    public string? Description { get; init; }
}

public record UpdateCharacterAssetDto
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
