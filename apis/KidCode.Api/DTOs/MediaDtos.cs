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
    Guid? AlbumId,
    DateTime CreatedAt
);

public record CreateMediaAssetDto(
    string Title,
    string? Source,
    int? Width,
    int? Height,
    double? Duration,
    Guid? AlbumId
);

public record AlbumDto(
    Guid Id,
    string Name,
    Guid? CoverMediaId,
    int MediaCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateAlbumDto(string Name);

public record UpdateAlbumDto(string? Name, Guid? CoverMediaId);
