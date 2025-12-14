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

    private string? GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpGet]
    public async Task<ActionResult<List<MediaAssetDto>>> GetMedia(
        [FromQuery] Guid? albumId,
        [FromQuery] string? source
    )
    {
        var userId = GetUserId();
        var query = _db
            .MediaAssets.Where(m => m.UserId == userId || m.UserId == null)
            .AsQueryable();

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
                m.AlbumId,
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
                m.AlbumId,
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
            asset.AlbumId,
            asset.CreatedAt
        );

        return CreatedAtAction(nameof(GetMediaById), new { id = asset.Id }, dto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMedia(Guid id)
    {
        var userId = GetUserId();
        var media = await _db.MediaAssets.FirstOrDefaultAsync(m =>
            m.Id == id && (m.UserId == userId || m.UserId == null)
        );

        if (media == null)
            return NotFound();

        _db.MediaAssets.Remove(media);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // Album endpoints
    [HttpGet("albums")]
    public async Task<ActionResult<List<AlbumDto>>> GetAlbums()
    {
        var userId = GetUserId();
        var albums = await _db
            .Albums.Where(a => a.UserId == userId || a.UserId == null)
            .OrderByDescending(a => a.UpdatedAt)
            .Select(a => new AlbumDto(
                a.Id,
                a.Name,
                a.CoverMediaId,
                a.MediaAssets.Count,
                a.CreatedAt,
                a.UpdatedAt
            ))
            .ToListAsync();

        return Ok(albums);
    }

    [HttpPost("albums")]
    public async Task<ActionResult<AlbumDto>> CreateAlbum([FromBody] CreateAlbumDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Album name is required");

        var userId = GetUserId();
        var album = new Album
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        _db.Albums.Add(album);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetAlbums),
            new AlbumDto(
                album.Id,
                album.Name,
                album.CoverMediaId,
                0,
                album.CreatedAt,
                album.UpdatedAt
            )
        );
    }

    [HttpDelete("albums/{id:guid}")]
    public async Task<IActionResult> DeleteAlbum(Guid id)
    {
        var userId = GetUserId();
        var album = await _db.Albums.FirstOrDefaultAsync(a =>
            a.Id == id && (a.UserId == userId || a.UserId == null)
        );

        if (album == null)
            return NotFound();

        _db.Albums.Remove(album);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
