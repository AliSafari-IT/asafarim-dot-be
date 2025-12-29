using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CoursesController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses([FromQuery] int? gradeLevel)
    {
        var courses = await _courseService.GetAllCoursesAsync(gradeLevel);
        return Ok(courses);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCourse(int id)
    {
        var course = await _courseService.GetByIdAsync(id);

        if (course == null)
            return NotFound();

        return Ok(course);
    }

    [HttpGet("{courseId}/chapters")]
    public async Task<IActionResult> GetChapters(int courseId)
    {
        var chapters = await _courseService.GetChaptersAsync(courseId);
        return Ok(chapters);
    }

    [HttpGet("chapters/{chapterId}/lessons")]
    public async Task<IActionResult> GetLessons(int chapterId)
    {
        var lessons = await _courseService.GetLessonsAsync(chapterId);
        return Ok(lessons);
    }

    [HttpGet("lessons/{lessonId}")]
    public async Task<IActionResult> GetLesson(int lessonId)
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);

        if (lesson == null)
            return NotFound();

        return Ok(lesson);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequest request)
    {
        var course = await _courseService.CreateCourseAsync(request);
        return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] UpdateCourseRequest request)
    {
        var course = await _courseService.GetByIdAsync(id);
        if (course == null)
            return NotFound();

        var updated = await _courseService.UpdateCourseAsync(id, request);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _courseService.GetByIdAsync(id);
        if (course == null)
            return NotFound();

        await _courseService.DeleteCourseAsync(id);
        return NoContent();
    }

    [HttpPost("delete-bulk")]
    public async Task<IActionResult> DeleteBulkCourses([FromBody] DeleteBulkCoursesRequest request)
    {
        await _courseService.DeleteBulkCoursesAsync(request.Ids);
        return NoContent();
    }

    [HttpPost("lessons")]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonRequest request)
    {
        var lesson = await _courseService.CreateLessonAsync(request);
        return CreatedAtAction(nameof(GetLesson), new { lessonId = lesson.LessonId }, lesson);
    }

    [HttpPut("lessons/{lessonId}")]
    public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] UpdateLessonRequest request)
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);
        if (lesson == null)
            return NotFound();

        var updated = await _courseService.UpdateLessonAsync(lessonId, request);
        return Ok(updated);
    }

    [HttpDelete("lessons/{lessonId}")]
    public async Task<IActionResult> DeleteLesson(int lessonId)
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);
        if (lesson == null)
            return NotFound();

        await _courseService.DeleteLessonAsync(lessonId);
        return NoContent();
    }
}

public record CreateCourseRequest(
    string Name,
    string? Description,
    int GradeLevel,
    string? ColorCode
);

public record UpdateCourseRequest(
    string? Name,
    string? Description,
    int? GradeLevel,
    string? ColorCode
);

public record CreateLessonRequest(
    int ChapterId,
    string Title,
    string? Content,
    int OrderIndex
);

public record UpdateLessonRequest(
    string? Title,
    string? Content,
    int? OrderIndex
);

public record DeleteBulkCoursesRequest(List<int> Ids);
