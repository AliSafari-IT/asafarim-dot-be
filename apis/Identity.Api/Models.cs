namespace Identity.Api;

public record RegisterRequest(string Email, string Password, string? UserName);

public record LoginRequest(string Email, string Password, bool RememberMe = false);

public record MeResponse(string Id, string? Email, string? UserName, string[] Roles);

public record UpdateProfileRequest(string? Email, string? UserName);

public record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword
);

// Admin DTOs
public record AdminUserDto(string Id, string? Email, string? UserName, string[] Roles);

public record AdminUserUpsert(
    string Email,
    string? UserName,
    string? Password,
    string[]? Roles = null
);

public record SetUserRolesRequest(string[] Roles);

// Batch users DTOs
public record BatchUsersRequest(string[] UserIds);

public record BatchUsersResponse(string UserId, string? Email, string? UserName);
