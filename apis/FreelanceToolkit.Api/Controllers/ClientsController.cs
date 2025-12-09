using System.Security.Claims;
using FreelanceToolkit.Api.DTOs.Client;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceToolkit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly IClientService _clientService;

    public ClientsController(IClientService clientService)
    {
        _clientService = clientService;
    }

    /// <summary>
    /// Get all clients with optional search and tag filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ClientResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ClientResponseDto>>> GetAll(
        [FromQuery] string? search = null,
        [FromQuery] List<string>? tags = null
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var clients = await _clientService.GetAllAsync(userId, search, tags);
        return Ok(clients);
    }

    /// <summary>
    /// Get a client by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientResponseDto>> GetById(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var client = await _clientService.GetByIdAsync(id, userId);
            return Ok(client);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Client with ID {id} not found" });
        }
    }

    /// <summary>
    /// Create a new client
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ClientResponseDto>> Create([FromBody] CreateClientDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var client = await _clientService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    /// <summary>
    /// Update an existing client
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ClientResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientResponseDto>> Update(
        Guid id,
        [FromBody] UpdateClientDto dto
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var client = await _clientService.UpdateAsync(id, dto, userId);
            return Ok(client);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Client with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete a client
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _clientService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Client with ID {id} not found" });
        }
    }
}
