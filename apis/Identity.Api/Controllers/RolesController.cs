// Controllers/RolesController.cs
using Identity.Api.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Identity.Api.Controllers
{
    [Authorize(Roles = "Admin,admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class RolesController : ControllerBase
    {
        private readonly RoleManager<IdentityRole<Guid>> _roleManager;
        private readonly ILogger<RolesController> _logger;

        public RolesController(
            RoleManager<IdentityRole<Guid>> roleManager,
            ILogger<RolesController> logger
        )
        {
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult GetRoles()
        {
            try
            {
                var roles = _roleManager
                    .Roles.Select(r => new RoleDto { Id = r.Id, Name = r.Name })
                    .ToList();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting roles");
                return StatusCode(500, "An error occurred while getting roles");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] RoleDto roleDto)
        {
            if (string.IsNullOrWhiteSpace(roleDto.Name))
            {
                return BadRequest("Role name is required");
            }

            var roleExists = await _roleManager.RoleExistsAsync(roleDto.Name);
            if (roleExists)
            {
                return Conflict($"Role '{roleDto.Name}' already exists");
            }

            var result = await _roleManager.CreateAsync(
                new IdentityRole<Guid>(roleDto.Name.Trim())
            );
            if (result.Succeeded)
            {
                _logger.LogInformation("Role {RoleName} created successfully", roleDto.Name);
                return Ok();
            }

            return BadRequest(result.Errors);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRole(Guid id, [FromBody] RoleDto roleDto)
        {
            if (string.IsNullOrWhiteSpace(roleDto.Name))
            {
                return BadRequest("Role name is required");
            }

            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null)
            {
                return NotFound("Role not found");
            }

            role.Name = roleDto.Name.Trim();
            role.NormalizedName = roleDto.Name.Trim().ToUpper();

            var result = await _roleManager.UpdateAsync(role);
            if (result.Succeeded)
            {
                _logger.LogInformation("Role {RoleId} updated to {RoleName}", id, roleDto.Name);
                return Ok();
            }

            return BadRequest(result.Errors);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(Guid id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null)
            {
                return NotFound("Role not found");
            }

            var result = await _roleManager.DeleteAsync(role);
            if (result.Succeeded)
            {
                _logger.LogInformation("Role {RoleId} deleted", id);
                return Ok();
            }

            return BadRequest(result.Errors);
        }
    }
}
