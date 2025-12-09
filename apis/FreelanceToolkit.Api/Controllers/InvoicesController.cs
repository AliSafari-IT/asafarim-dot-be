using System.Security.Claims;
using FreelanceToolkit.Api.DTOs.Invoice;
using FreelanceToolkit.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreelanceToolkit.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceService _invoiceService;
    private readonly IPdfService _pdfService;

    public InvoicesController(IInvoiceService invoiceService, IPdfService pdfService)
    {
        _invoiceService = invoiceService;
        _pdfService = pdfService;
    }

    /// <summary>
    /// Get all invoices with optional filters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<InvoiceResponseDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<InvoiceResponseDto>>> GetAll(
        [FromQuery] string? status = null,
        [FromQuery] Guid? clientId = null
    )
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // Update overdue statuses first
        await _invoiceService.UpdateOverdueStatusesAsync(userId);

        var invoices = await _invoiceService.GetAllAsync(userId, status, clientId);
        return Ok(invoices);
    }

    /// <summary>
    /// Get an invoice by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(InvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponseDto>> GetById(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.GetByIdAsync(id, userId);
            return Ok(invoice);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Create a new invoice
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(InvoiceResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<InvoiceResponseDto>> Create([FromBody] CreateInvoiceDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, invoice);
        }
        catch (KeyNotFoundException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Update an existing invoice
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(InvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponseDto>> Update(
        Guid id,
        [FromBody] UpdateInvoiceDto dto
    )
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.UpdateAsync(id, dto, userId);
            return Ok(invoice);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Delete an invoice
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _invoiceService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Mark an invoice as paid
    /// </summary>
    [HttpPost("{id}/paid")]
    [ProducesResponseType(typeof(InvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponseDto>> MarkAsPaid(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.MarkAsPaidAsync(id, userId);
            return Ok(invoice);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Mark an invoice as cancelled
    /// </summary>
    [HttpPost("{id}/cancel")]
    [ProducesResponseType(typeof(InvoiceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<InvoiceResponseDto>> MarkAsCancelled(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.MarkAsCancelledAsync(id, userId);
            return Ok(invoice);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Generate HTML preview of invoice
    /// </summary>
    [HttpGet("{id}/html")]
    [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<string>> GetHtml(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var html = await _invoiceService.GenerateHtmlAsync(id, userId);
            return Content(html, "text/html");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }

    /// <summary>
    /// Generate PDF of invoice
    /// </summary>
    [HttpGet("{id}/pdf")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPdf(Guid id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var invoice = await _invoiceService.GetByIdAsync(id, userId);
            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(id, userId);
            return File(pdfBytes, "application/pdf", $"Invoice-{invoice.InvoiceNumber}.pdf");
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Invoice with ID {id} not found" });
        }
    }
}
