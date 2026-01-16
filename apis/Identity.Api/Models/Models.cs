using System.ComponentModel.DataAnnotations;

namespace Identity.Api.Models;

public record RegisterRequest(
    string Email,
    string Password,
    string? UserName,
    string FirstName,
    string LastName
);

public record LoginRequest(
    string Email,
    string Password,
    bool RememberMe = false,
    string? ReturnUrl = null
);

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
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
        string Email,
    [StringLength(256, ErrorMessage = "Username cannot exceed 256 characters")] string? UserName,
    string? Password,
    string[]? Roles = null
);

public record SetUserRolesRequest(string[] Roles);

// Registration response
public record RegisterResponse(
    bool Registered,
    bool RequiresEmailConfirmation,
    string Email,
    bool EmailSent,
    string Message
);

// Email confirmation
public record ResendConfirmationRequest(string Email);

public record ConfirmEmailRequest(string UserId, string Token);

// Batch users DTOs
public record BatchUsersRequest(string[] UserIds);

public record BatchUsersResponse(string UserId, string? Email, string? UserName);
