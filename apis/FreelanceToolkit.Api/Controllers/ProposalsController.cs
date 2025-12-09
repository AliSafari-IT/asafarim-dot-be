using System.Security.Claims;
using FreelanceToolkit.Api.DTOs.Proposal;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceToolkit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProposalsController : ControllerBase
{
    private readonly IProposalService _proposalService;
    private readonly IPdfService _pdfService;

    public ProposalsController(IProposalService proposalService, IPdfService pdfService)
    {
        _proposalService = proposalService;
        _pdfService = pdfService;
    }

    /// <summary>
    /// Get all proposals with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<ProposalResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProposalResponseDto>>> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] Guid? clientId = null
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var proposals = await _proposalService.GetAllAsync(userId, status, clientId);
        return Ok(proposals);
    }

    /// <summary>
    /// Get a proposal by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> GetById(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.GetByIdAsync(id, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Create a new proposal
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProposalResponseDto>> Create([FromBody] CreateProposalDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = proposal.Id }, proposal);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing proposal
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> Update(
        Guid id,
        [FromBody] UpdateProposalDto dto
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.UpdateAsync(id, dto, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete a proposal
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _proposalService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Send a proposal to client
    /// </summary>
    [HttpPost("{id}/send")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> Send(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.SendAsync(id, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Accept a proposal
    /// </summary>
    [HttpPost("{id}/accept")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> Accept(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.AcceptAsync(id, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Reject a proposal
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> Reject(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.RejectAsync(id, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Create a new version of a proposal
    /// </summary>
    [HttpPost("{id}/versions")]
    [ProducesResponseType(typeof(ProposalResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalResponseDto>> CreateVersion(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.CreateVersionAsync(id, userId);
            return Ok(proposal);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Get all versions of a proposal
    /// </summary>
    [HttpGet("{id}/versions")]
    [ProducesResponseType(typeof(List<ProposalVersionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<List<ProposalVersionDto>>> GetVersions(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var versions = await _proposalService.GetVersionsAsync(id, userId);
            return Ok(versions);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Generate HTML preview of proposal
    /// </summary>
    [HttpGet("{id}/html")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<string>> GetHtml(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var html = await _proposalService.GenerateHtmlAsync(id, userId);
            return Content(html, "text/html");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    /// <summary>
    /// Generate PDF of proposal
    /// </summary>
    [HttpGet("{id}/pdf")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var proposal = await _proposalService.GetByIdAsync(id, userId);
            var pdfBytes = await _pdfService.GenerateProposalPdfAsync(id, userId);
            return File(pdfBytes, "application/pdf", $"Proposal-{proposal.ProposalNumber}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Proposal with ID {id} not found" });
        }
    }

    // Template endpoints
    /// <summary>
    /// Get all proposal templates
    /// </summary>
    [HttpGet("templates")]
    [ProducesResponseType(typeof(List<ProposalTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProposalTemplateDto>>> GetTemplates()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var templates = await _proposalService.GetTemplatesAsync(userId);
        return Ok(templates);
    }

    /// <summary>
    /// Get a template by ID
    /// </summary>
    [HttpGet("templates/{id}")]
    [ProducesResponseType(typeof(ProposalTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProposalTemplateDto>> GetTemplateById(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var template = await _proposalService.GetTemplateByIdAsync(id, userId);
            return Ok(template);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Template with ID {id} not found" });
        }
    }

    /// <summary>
    /// Create a new proposal template
    /// </summary>
    [HttpPost("templates")]
    [ProducesResponseType(typeof(ProposalTemplateDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProposalTemplateDto>> CreateTemplate(
        [FromBody] ProposalTemplateDto dto
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var template = await _proposalService.CreateTemplateAsync(dto, userId);
        return CreatedAtAction(nameof(GetTemplateById), new { id = template.Id }, template);
    }

    /// <summary>
    /// Delete a proposal template
    /// </summary>
    [HttpDelete("templates/{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteTemplate(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _proposalService.DeleteTemplateAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Template with ID {id} not found" });
        }
    }
}
