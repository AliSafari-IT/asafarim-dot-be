using KidCode.Api.Models;

namespace KidCode.Api.DTOs;

public record MediaAssetDto(
    Guid Id,
    string FileName,
    string ContentType,
    long Size,
    string Title,
    string? Source,
    int? Width,
    int? Height,
    double? Duration,
    string? ScriptJson,
    Guid? AlbumId,
    string? UserId,
    DateTime CreatedAt
);

public record CreateMediaAssetDto(
    string Title,
    string? Source,
    int? Width,
    int? Height,
    double? Duration,
    string? ScriptJson,
    Guid? AlbumId
);

public record AlbumDto(
    Guid Id,
    string Name,
    string? Description,
    Guid? CoverMediaId,
    string? CoverUrl,
    AlbumVisibility Visibility,
    int MediaCount,
    string? UserId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateAlbumDto(string Name, string? Description, AlbumVisibility Visibility);

public record UpdateAlbumDto(
    string? Name,
    string? Description,
    Guid? CoverMediaId,
    AlbumVisibility? Visibility
);

public record AddMediaToAlbumDto(Guid MediaId);

public record RemoveMediaFromAlbumDto(Guid MediaId);
