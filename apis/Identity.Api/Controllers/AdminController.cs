using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Roles = "admin")]
public class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;

    public AdminController(
        UserManager<AppUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager
    )
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var allUsers = _userManager.Users.ToList();
        var roleNames = _roleManager.Roles.ToDictionary(r => r.Id, r => r.Name);
        var result = new List<AdminUserDto>();
        foreach (var u in allUsers)
        {
            // Roles for ASP.NET Core IdentityCore without navigation requires manager
            var names = (await _userManager.GetRolesAsync(u)).ToArray();
            result.Add(new AdminUserDto(u.Id.ToString(), u.Email, u.UserName, names));
        }
        return Ok(result);
    }

    [HttpGet("roles")]
    public IActionResult GetAllRoles()
    {
        return Ok(_roleManager.Roles.Select(r => new { id = r.Id, name = r.Name }));
    }

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound();
        var names = (await _userManager.GetRolesAsync(user)).ToArray();
        return Ok(new AdminUserDto(user.Id.ToString(), user.Email, user.UserName, names));
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(AdminUserUpsert req)
    {
        var user = new AppUser
        {
            Id = Guid.NewGuid(),
            Email = req.Email,
            UserName = req.UserName ?? req.Email,
        };
        var result = await _userManager.CreateAsync(
            user,
            req.Password ?? Guid.NewGuid().ToString("N") + "Aa1!"
        );
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }
        return Ok(new { id = user.Id });
    }
    
    [HttpPost("users/with-null-password")]
    public async Task<IActionResult> CreateUserWithNullPassword(AdminUserUpsert req)
    {
        try
        {
            // Validate request
            if (string.IsNullOrEmpty(req.Email))
            {
                return BadRequest(new { message = "Email is required" });
            }
            
            // Create user object
            var user = new AppUser
            {
                Id = Guid.NewGuid(),
                Email = req.Email,
                UserName = req.UserName ?? req.Email,
                EmailConfirmed = true // Auto-confirm email for admin-created users
            };
            
            // Create user without password
            var result = await _userManager.CreateAsync(user);
            
            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError(error.Code, error.Description);
                }
                return ValidationProblem(ModelState);
            }
            
            // Add roles if specified
            if (req.Roles != null && req.Roles.Any())
            {
                var validRoles = new List<string>();
                foreach (var role in req.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(role))
                    {
                        validRoles.Add(role);
                    }
                }
                
                if (validRoles.Any())
                {
                    await _userManager.AddToRolesAsync(user, validRoles);
                }
            }
            
            return Ok(new { 
                id = user.Id.ToString(),
                email = user.Email,
                userName = user.UserName,
                message = "User created successfully with null password hash. User will need to set password on first login."
            });
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.Error.WriteLine($"Error creating user with null password: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while creating the user", error = ex.Message });
        }
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, AdminUserUpsert req)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound();
        if (!string.IsNullOrWhiteSpace(req.Email))
            user.Email = req.Email;
        if (!string.IsNullOrWhiteSpace(req.UserName))
            user.UserName = req.UserName;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }
        return Ok();
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound();
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }
            return ValidationProblem(ModelState);
        }
        return Ok();
    }

    [HttpPost("users/{id:guid}/roles")]
    public async Task<IActionResult> SetUserRoles(Guid id, SetUserRolesRequest req)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound();
        var current = await _userManager.GetRolesAsync(user);
        var target = req.Roles?.Distinct().ToArray() ?? Array.Empty<string>();
        var toRemove = current.Where(r => !target.Contains(r)).ToArray();
        var toAdd = target.Where(r => !current.Contains(r)).ToArray();
        if (toRemove.Length > 0)
            await _userManager.RemoveFromRolesAsync(user, toRemove);
        if (toAdd.Length > 0)
        {
            foreach (var role in toAdd)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                    return BadRequest(new { message = $"Role '{role}' does not exist" });
            }
            await _userManager.AddToRolesAsync(user, toAdd);
        }
        return Ok();
    }

    [HttpGet("users/{id:guid}/roles")]
    public async Task<IActionResult> GetUserRoles(Guid id)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
            return NotFound();
        var roles = await _userManager.GetRolesAsync(user);
        return Ok(roles);
    }

    [HttpPost("users/{id:guid}/reset-password")]
    public async Task<IActionResult> ResetUserPassword(Guid id, AdminResetPasswordRequest req)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user is null)
                return NotFound(new { message = $"User with ID {id} not found" });
            
            // Remove existing password if any
            if (!string.IsNullOrEmpty(user.PasswordHash))
            {
                // Generate a reset token
                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                
                // Reset the password with the new one or a generated one
                var result = await _userManager.ResetPasswordAsync(
                    user,
                    resetToken,
                    req.NewPassword ?? Guid.NewGuid().ToString("N") + "Aa1!"
                );
                
                if (!result.Succeeded)
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }
            }
            else
            {
                // If user has no password, set one directly
                var result = await _userManager.AddPasswordAsync(
                    user,
                    req.NewPassword ?? Guid.NewGuid().ToString("N") + "Aa1!"
                );
                
                if (!result.Succeeded)
                {
                    foreach (var error in result.Errors)
                    {
                        ModelState.AddModelError(error.Code, error.Description);
                    }
                    return ValidationProblem(ModelState);
                }
            }
            
            return Ok(new { 
                message = "Password has been reset successfully",
                passwordWasGenerated = req.NewPassword == null
            });
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.Error.WriteLine($"Error resetting password: {ex.Message}");
            return StatusCode(500, new { message = "An error occurred while resetting the password", error = ex.Message });
        }
    }
}
