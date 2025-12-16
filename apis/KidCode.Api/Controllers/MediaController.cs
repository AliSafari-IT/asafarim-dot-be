using System.Security.Claims;
using KidCode.Api.Data;
using KidCode.Api.DTOs;
using KidCode.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    private readonly KidCodeDbContext _db;
    private readonly long _maxFileSize = 10 * 1024 * 1024; // 10MB

    public MediaController(KidCodeDbContext db)
    {
        _db = db;
    }

    private string? GetUserId() =>
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;

    [HttpGet]
    public async Task<ActionResult<List<MediaAssetDto>>> GetMedia(
        [FromQuery] Guid? albumId,
        [FromQuery] string? source,
        [FromQuery] bool? myMediaOnly
    )
    {
        var userId = GetUserId();
        var query = _db.MediaAssets.AsQueryable();

        // If filtering by album, check album visibility first
        if (albumId.HasValue)
        {
            var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == albumId.Value);
            if (album != null)
            {
                // settings-images albums are ALWAYS private
                if (album.Name == "settings-images" && album.UserId != userId)
                {
                    return Forbid();
                }

                // Check if user has access to this album
                var hasAccess =
                    album.UserId == userId
                    || album.Visibility == AlbumVisibility.Public
                    || (
                        album.Visibility == AlbumVisibility.MembersOnly
                        && !string.IsNullOrEmpty(userId)
                    );

                if (!hasAccess)
                {
                    return Forbid();
                }
            }
        }

        // Filter by ownership
        if (myMediaOnly == true)
        {
            query = query.Where(m => m.UserId == userId);
        }
        else
        {
            // Show user's media + public media from others
            query = query.Where(m => m.UserId == userId || m.UserId == null);
        }

        if (albumId.HasValue)
            query = query.Where(m => m.AlbumId == albumId.Value);

        if (!string.IsNullOrEmpty(source))
            query = query.Where(m => m.Source == source);

        var media = await query
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new MediaAssetDto(
                m.Id,
                m.FileName,
                m.ContentType,
                m.Size,
                m.Title,
                m.Source,
                m.Width,
                m.Height,
                m.Duration,
                m.ScriptJson,
                m.AlbumId,
                m.UserId,
                m.CreatedAt
            ))
            .ToListAsync();

        return Ok(media);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MediaAssetDto>> GetMediaById(Guid id)
    {
        var userId = GetUserId();
        var media = await _db
            .MediaAssets.Where(m => m.Id == id && (m.UserId == userId || m.UserId == null))
            .Select(m => new MediaAssetDto(
                m.Id,
                m.FileName,
                m.ContentType,
                m.Size,
                m.Title,
                m.Source,
                m.Width,
                m.Height,
                m.Duration,
                m.ScriptJson,
                m.AlbumId,
                m.UserId,
                m.CreatedAt
            ))
            .FirstOrDefaultAsync();

        if (media == null)
            return NotFound();

        return Ok(media);
    }

    [HttpGet("{id:guid}/content")]
    public async Task<IActionResult> GetMediaContent(Guid id)
    {
        var userId = GetUserId();
        var media = await _db
            .MediaAssets.Where(m => m.Id == id && (m.UserId == userId || m.UserId == null))
            .Select(m => new
            {
                m.Content,
                m.ContentType,
                m.FileName,
            })
            .FirstOrDefaultAsync();

        if (media == null)
            return NotFound();

        return File(media.Content, media.ContentType, media.FileName);
    }

    [HttpPost]
    [RequestSizeLimit(10_485_760)] // 10MB
    public async Task<ActionResult<MediaAssetDto>> UploadMedia(
        IFormFile file,
        [FromForm] string? title,
        [FromForm] string? source,
        [FromForm] int? width,
        [FromForm] int? height,
        [FromForm] double? duration,
        [FromForm] string? scriptJson,
        [FromForm] Guid? albumId
    )
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        if (file.Length > _maxFileSize)
            return BadRequest(
                $"File size exceeds maximum allowed size of {_maxFileSize / 1024 / 1024}MB"
            );

        var allowedTypes = new[] { "image/", "video/" };
        if (!allowedTypes.Any(t => file.ContentType.StartsWith(t)))
            return BadRequest("Only image and video files are allowed");

        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var content = ms.ToArray();

        var userId = GetUserId();
        var asset = new MediaAsset
        {
            Id = Guid.NewGuid(),
            FileName = file.FileName,
            ContentType = file.ContentType,
            Size = file.Length,
            Content = content,
            Title = title ?? Path.GetFileNameWithoutExtension(file.FileName),
            Source = source ?? "upload",
            Width = width,
            Height = height,
            Duration = duration,
            ScriptJson = scriptJson,
            AlbumId = albumId,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
        };

        _db.MediaAssets.Add(asset);
        await _db.SaveChangesAsync();

        var dto = new MediaAssetDto(
            asset.Id,
            asset.FileName,
            asset.ContentType,
            asset.Size,
            asset.Title,
            asset.Source,
            asset.Width,
            asset.Height,
            asset.Duration,
            asset.ScriptJson,
            asset.AlbumId,
            asset.UserId,
            asset.CreatedAt
        );

        return CreatedAtAction(nameof(GetMediaById), new { id = asset.Id }, dto);
    }

    [HttpPut("{id:guid}")]
    [RequestSizeLimit(10_485_760)]
    public async Task<ActionResult<MediaAssetDto>> UpdateMedia(
        Guid id,
        IFormFile? file,
        [FromForm] string? title,
        [FromForm] string? scriptJson
    )
    {
        var userId = GetUserId();
        var media = await _db.MediaAssets.FirstOrDefaultAsync(m =>
            m.Id == id && m.UserId == userId
        );

        if (media == null)
            return NotFound();

        if (file != null && file.Length > 0)
        {
            if (file.Length > _maxFileSize)
                return BadRequest(
                    $"File size exceeds maximum allowed size of {_maxFileSize / 1024 / 1024}MB"
                );

            var allowedTypes = new[] { "image/", "video/" };
            if (!allowedTypes.Any(t => file.ContentType.StartsWith(t)))
                return BadRequest("Only image and video files are allowed");

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            media.Content = ms.ToArray();
            media.ContentType = file.ContentType;
            media.Size = file.Length;
            media.FileName = file.FileName;
        }

        if (!string.IsNullOrEmpty(title))
            media.Title = title;

        if (scriptJson != null)
            media.ScriptJson = scriptJson;

        await _db.SaveChangesAsync();

        var dto = new MediaAssetDto(
            media.Id,
            media.FileName,
            media.ContentType,
            media.Size,
            media.Title,
            media.Source,
            media.Width,
            media.Height,
            media.Duration,
            media.ScriptJson,
            media.AlbumId,
            media.UserId,
            media.CreatedAt
        );

        return Ok(dto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMedia(Guid id)
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
        {
            return Forbid();
        }

        var media = await _db.MediaAssets.FirstOrDefaultAsync(m =>
            m.Id == id && m.UserId == userId
        );

        if (media == null)
            return NotFound();

        _db.MediaAssets.Remove(media);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Album endpoints
    [HttpGet("albums")]
    public async Task<ActionResult<List<AlbumDto>>> GetAlbums(
        [FromQuery] bool? myAlbumsOnly,
        [FromQuery] string? visibility
    )
    {
        var userId = GetUserId();
        var query = _db.Albums.AsQueryable();

        // Filter by ownership
        if (myAlbumsOnly == true)
        {
            query = query.Where(a => a.UserId == userId);
        }
        else
        {
            // Show user's albums + public albums + members-only (only if authenticated)
            if (string.IsNullOrEmpty(userId))
            {
                // Not authenticated - only show public albums, NEVER settings-images
                query = query.Where(a =>
                    a.Visibility == AlbumVisibility.Public && a.Name != "settings-images"
                );
            }
            else
            {
                // Authenticated - show own albums + public (excluding others' settings-images) + members-only
                query = query.Where(a =>
                    a.UserId == userId
                    || (a.Visibility == AlbumVisibility.Public && a.Name != "settings-images")
                    || (a.Visibility == AlbumVisibility.MembersOnly && a.Name != "settings-images")
                );
            }
        }

        // Filter by visibility
        if (
            !string.IsNullOrEmpty(visibility)
            && Enum.TryParse<AlbumVisibility>(visibility, true, out var visibilityEnum)
        )
        {
            query = query.Where(a => a.Visibility == visibilityEnum);
        }

        var albums = await query
            .OrderByDescending(a => a.UpdatedAt)
            .Select(a => new AlbumDto(
                a.Id,
                a.Name,
                a.Description,
                a.CoverMediaId,
                a.CoverMediaId.HasValue ? $"/api/media/{a.CoverMediaId}/content" : null,
                a.Visibility,
                a.MediaAssets.Count,
                a.UserId,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        if (!string.IsNullOrEmpty(userId))
        {
            albums = albums
                .Where(a => !(a.Name == "settings-images" && a.UserId == userId))
                .ToList();

            var settings = await _db
                .Albums.Where(a => a.UserId == userId && a.Name == "settings-images")
                .OrderByDescending(a => a.UpdatedAt)
                .FirstOrDefaultAsync();

            if (settings != null)
            {
                var settingsCount = await _db.MediaAssets.CountAsync(m => m.AlbumId == settings.Id);
                albums.Insert(
                    0,
                    new AlbumDto(
                        settings.Id,
                        settings.Name,
                        settings.Description,
                        settings.CoverMediaId,
                        settings.CoverMediaId.HasValue
                            ? $"/api/media/{settings.CoverMediaId}/content"
                            : null,
                        AlbumVisibility.Private,
                        settingsCount,
                        settings.UserId,
                        settings.CreatedAt,
                        settings.UpdatedAt
                    )
                );
            }
        }

        return Ok(albums);
    }

    [HttpGet("albums/{id:guid}")]
    public async Task<ActionResult<AlbumDto>> GetAlbumById(Guid id)
    {
        var userId = GetUserId();

        var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == id);

        if (album == null)
            return NotFound();

        // settings-images albums are ALWAYS private
        if (album.Name == "settings-images" && album.UserId != userId)
        {
            return Forbid();
        }

        // Check visibility
        var hasAccess =
            album.UserId == userId
            || album.Visibility == AlbumVisibility.Public
            || (album.Visibility == AlbumVisibility.MembersOnly && !string.IsNullOrEmpty(userId));

        if (!hasAccess)
            return Forbid();

        var mediaCount = await _db.MediaAssets.CountAsync(m => m.AlbumId == album.Id);

        return Ok(
            new AlbumDto(
                album.Id,
                album.Name,
                album.Description,
                album.CoverMediaId,
                album.CoverMediaId.HasValue ? $"/api/media/{album.CoverMediaId}/content" : null,
                album.Visibility,
                mediaCount,
                album.UserId,
                album.CreatedAt,
                album.UpdatedAt
            )
        );
    }

    [HttpPost("albums")]
    public async Task<ActionResult<AlbumDto>> CreateAlbum([FromBody] CreateAlbumDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Album name is required");

        var userId = GetUserId();

        if (dto.Name == "settings-images")
        {
            if (string.IsNullOrEmpty(userId))
            {
                return Forbid();
            }

            var existing = await _db
                .Albums.Where(a => a.UserId == userId && a.Name == "settings-images")
                .OrderByDescending(a => a.UpdatedAt)
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                var existingCount = await _db.MediaAssets.CountAsync(m => m.AlbumId == existing.Id);
                return Ok(
                    new AlbumDto(
                        existing.Id,
                        existing.Name,
                        existing.Description,
                        existing.CoverMediaId,
                        existing.CoverMediaId.HasValue
                            ? $"/api/media/{existing.CoverMediaId}/content"
                            : null,
                        AlbumVisibility.Private,
                        existingCount,
                        existing.UserId,
                        existing.CreatedAt,
                        existing.UpdatedAt
                    )
                );
            }
        }

        var album = new Album
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            Visibility = dto.Name == "settings-images" ? AlbumVisibility.Private : dto.Visibility,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Albums.Add(album);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAlbumById),
            new { id = album.Id },
            new AlbumDto(
                album.Id,
                album.Name,
                album.Description,
                album.CoverMediaId,
                null,
                album.Visibility,
                0,
                album.UserId,
                album.CreatedAt,
                album.UpdatedAt
            )
        );
    }

    [HttpPut("albums/{id:guid}")]
    public async Task<ActionResult<AlbumDto>> UpdateAlbum(Guid id, [FromBody] UpdateAlbumDto dto)
    {
        var userId = GetUserId();
        var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (album == null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Name))
            album.Name = dto.Name;

        if (dto.Description != null)
            album.Description = dto.Description;

        if (dto.CoverMediaId.HasValue)
            album.CoverMediaId = dto.CoverMediaId.Value;

        if (dto.Visibility.HasValue)
            album.Visibility = dto.Visibility.Value;

        album.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var mediaCount = await _db.MediaAssets.CountAsync(m => m.AlbumId == album.Id);

        return Ok(
            new AlbumDto(
                album.Id,
                album.Name,
                album.Description,
                album.CoverMediaId,
                album.CoverMediaId.HasValue ? $"/api/media/{album.CoverMediaId}/content" : null,
                album.Visibility,
                mediaCount,
                album.UserId,
                album.CreatedAt,
                album.UpdatedAt
            )
        );
    }

    [HttpDelete("albums/{id:guid}")]
    public async Task<IActionResult> DeleteAlbum(Guid id)
    {
        var userId = GetUserId();
        var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (album == null)
            return NotFound();

        _db.Albums.Remove(album);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("albums/{id:guid}/media")]
    public async Task<ActionResult<MediaAssetDto>> AddMediaToAlbum(
        Guid id,
        [FromBody] AddMediaToAlbumDto dto
    )
    {
        var userId = GetUserId();
        var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (album == null)
            return NotFound("Album not found or you don't have permission");

        var media = await _db.MediaAssets.FirstOrDefaultAsync(m =>
            m.Id == dto.MediaId && m.UserId == userId
        );

        if (media == null)
            return NotFound("Media not found or you don't have permission");

        media.AlbumId = id;
        album.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(
            new MediaAssetDto(
                media.Id,
                media.FileName,
                media.ContentType,
                media.Size,
                media.Title,
                media.Source,
                media.Width,
                media.Height,
                media.Duration,
                media.ScriptJson,
                media.AlbumId,
                media.UserId,
                media.CreatedAt
            )
        );
    }

    [HttpDelete("albums/{id:guid}/media/{mediaId:guid}")]
    public async Task<IActionResult> RemoveMediaFromAlbum(Guid id, Guid mediaId)
    {
        var userId = GetUserId();
        var album = await _db.Albums.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

        if (album == null)
            return NotFound("Album not found or you don't have permission");

        var media = await _db.MediaAssets.FirstOrDefaultAsync(m =>
            m.Id == mediaId && m.AlbumId == id && m.UserId == userId
        );

        if (media == null)
            return NotFound("Media not found in this album");

        media.AlbumId = null;
        album.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
