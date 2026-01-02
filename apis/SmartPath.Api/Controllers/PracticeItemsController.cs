using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.DTOs;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[ApiController]
[Route("api/practice-items")]
[Authorize]
public class PracticeItemsController : ControllerBase
{
    private readonly IPracticeItemService _itemService;
    private readonly ILogger<PracticeItemsController> _logger;

    public PracticeItemsController(
        IPracticeItemService itemService,
        ILogger<PracticeItemsController> logger
    )
    {
        _itemService = itemService;
        _logger = logger;
    }

    [HttpGet]
    public async System.Threading.Tasks.Task<ActionResult<List<PracticeItemDto>>> GetItemsByLesson(
        [FromQuery] int lessonId
    )
    {
        try
        {
            var items = await _itemService.GetItemsByLessonAsync(lessonId);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting practice items for lesson {LessonId}", lessonId);
            return StatusCode(500, new { error = "Failed to get items" });
        }
    }

    [HttpPost]
    [Authorize(Roles = "familyManager,admin")]
    public async System.Threading.Tasks.Task<ActionResult<PracticeItemDto>> CreateItem(
        [FromBody] CreatePracticeItemDto dto
    )
    {
        try
        {
            var userId = GetUserId();
            var item = await _itemService.CreateItemAsync(dto, userId);
            return CreatedAtAction(
                nameof(GetItemsByLesson),
                new { lessonId = item.LessonId },
                item
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating practice item");
            return StatusCode(500, new { error = "Failed to create item" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "familyManager,admin")]
    public async System.Threading.Tasks.Task<ActionResult<PracticeItemDto>> UpdateItem(
        int id,
        [FromBody] UpdatePracticeItemDto dto
    )
    {
        try
        {
            var userId = GetUserId();
            var item = await _itemService.UpdateItemAsync(id, dto, userId);
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating practice item {ItemId}", id);
            return StatusCode(500, new { error = "Failed to update item" });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "familyManager,admin")]
    public async System.Threading.Tasks.Task<ActionResult> DeleteItem(int id)
    {
        try
        {
            var userId = GetUserId();
            await _itemService.DeleteItemAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting practice item {ItemId}", id);
            return StatusCode(500, new { error = "Failed to delete item" });
        }
    }

    private int GetUserId()
    {
        if (!HttpContext.Items.TryGetValue("UserId", out var userIdObj) || userIdObj == null)
        {
            if (HttpContext.Items.TryGetValue("UserSyncError", out var errorObj))
            {
                throw new InvalidOperationException("User sync failed: " + errorObj);
            }
            throw new InvalidOperationException("User context not available");
        }

        if (!int.TryParse(userIdObj.ToString(), out var userId) || userId == 0)
        {
            throw new InvalidOperationException("Invalid user ID");
        }

        return userId;
    }
}
