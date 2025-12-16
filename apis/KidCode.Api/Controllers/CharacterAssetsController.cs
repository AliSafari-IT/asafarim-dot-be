using System.Security.Claims;
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

    private string? GetUserId()
    {
        var userId =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        return string.IsNullOrWhiteSpace(userId) ? null : userId;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CharacterAssetDto>>> GetCharacterAssets()
    {
        var userId = GetUserId();

        // Return defaults (UserId=null) + user's own characters
        // Guests (userId=null) see only defaults
        var characters = await _context
            .CharacterAssets.Include(c => c.MediaAsset)
            .Where(c => c.UserId == null || c.UserId == userId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

        var dtos = characters.Select(c => new CharacterAssetDto
        {
            Id = c.Id,
            Name = c.Name,
            MediaAssetId = c.MediaAssetId,
            Description = c.Description,
            CreatedAt = c.CreatedAt,
            UserId = c.UserId,
        });

        return Ok(dtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterAssetDto>> GetCharacterAsset(Guid id)
    {
        var userId = GetUserId();
        var character = await _context
            .CharacterAssets.Include(c => c.MediaAsset)
            .Where(c => c.Id == id && (c.UserId == null || c.UserId == userId))
            .FirstOrDefaultAsync();

        if (character == null)
        {
            return NotFound();
        }

        return Ok(
            new CharacterAssetDto
            {
                Id = character.Id,
                Name = character.Name,
                MediaAssetId = character.MediaAssetId,
                Description = character.Description,
                CreatedAt = character.CreatedAt,
                UserId = character.UserId,
            }
        );
    }

    [HttpPost]
    public async Task<ActionResult<CharacterAssetDto>> CreateCharacterAsset(
        CreateCharacterAssetDto dto
    )
    {
        var userId = GetUserId();

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
            UserId = userId,
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
            UserId = character.UserId,
        };

        return CreatedAtAction(nameof(GetCharacterAsset), new { id = character.Id }, resultDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CharacterAssetDto>> UpdateCharacterAsset(
        Guid id,
        UpdateCharacterAssetDto dto
    )
    {
        var userId = GetUserId();
        var character = await _context.CharacterAssets.FirstOrDefaultAsync(c =>
            c.Id == id && c.UserId == userId
        );

        if (character == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(dto.Name))
            character.Name = dto.Name;

        if (dto.Description != null)
            character.Description = dto.Description;

        character.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(
            new CharacterAssetDto
            {
                Id = character.Id,
                Name = character.Name,
                MediaAssetId = character.MediaAssetId,
                Description = character.Description,
                CreatedAt = character.CreatedAt,
                UserId = character.UserId,
            }
        );
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCharacterAsset(Guid id)
    {
        var userId = GetUserId();

        if (string.IsNullOrEmpty(userId))
        {
            return Forbid();
        }

        var character = await _context.CharacterAssets.FirstOrDefaultAsync(c =>
            c.Id == id && c.UserId == userId
        );

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
    public string? UserId { get; init; }
}

public record CreateCharacterAssetDto(string Name, Guid MediaAssetId, string? Description);

public record UpdateCharacterAssetDto(string? Name, string? Description);
