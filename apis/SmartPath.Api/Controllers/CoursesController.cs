using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartPath.Api.Services;
using IAuthorizationService = SmartPath.Api.Services.IAuthorizationService;

namespace SmartPath.Api.Controllers;

[Authorize]
[ApiController]
[Route("[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseService _courseService;
    private readonly IAuthorizationService _authService;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(
        ICourseService courseService,
        IAuthorizationService authService,
        ILogger<CoursesController> logger
    )
    {
        _courseService = courseService;
        _authService = authService;
        _logger = logger;
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

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewCourseAsync(id, userId);

        if (!canView)
            return Forbid();

        return Ok(MapCourseToResponse(course));
    }

    [HttpPost]
    public async Task<IActionResult> CreateCourse([FromBody] CreateCourseRequestDto request)
    {
        var userId = (int)HttpContext.Items["UserId"]!;

        var canCreate = await _authService.CanCreateCourseAsync(request.FamilyId, userId);
        if (!canCreate)
            return Forbid();

        var course = new Entities.Course
        {
            FamilyId = request.FamilyId,
            CreatedByUserId = userId,
            Name = request.Name,
            Description = request.Description,
            GradeLevel = request.GradeLevel,
            IconUrl = request.IconUrl,
            ColorCode = request.ColorCode,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _courseService.CreateAsync(course);
        _logger.LogInformation(
            "Course {CourseId} created by user {UserId} in family {FamilyId}",
            created.CourseId,
            userId,
            request.FamilyId
        );

        return CreatedAtAction(
            nameof(GetCourse),
            new { id = created.CourseId },
            MapCourseToResponse(created)
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCourse(int id, [FromBody] UpdateCourseRequestDto request)
    {
        var course = await _courseService.GetByIdAsync(id);

        if (course == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canEdit = await _authService.CanEditCourseAsync(id, userId);

        if (!canEdit)
            return Forbid();

        course.Name = request.Name;
        course.Description = request.Description;
        course.GradeLevel = request.GradeLevel;
        course.IconUrl = request.IconUrl;
        course.ColorCode = request.ColorCode;
        course.IsActive = request.IsActive;
        course.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseService.UpdateAsync(course);
        _logger.LogInformation("Course {CourseId} updated by user {UserId}", id, userId);

        return Ok(MapCourseToResponse(updated));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _courseService.GetByIdAsync(id);

        if (course == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canDelete = await _authService.CanDeleteCourseAsync(id, userId);

        if (!canDelete)
            return Forbid();

        await _courseService.DeleteAsync(id);
        _logger.LogInformation("Course {CourseId} deleted by user {UserId}", id, userId);

        return NoContent();
    }

    [HttpGet("{courseId}/chapters")]
    public async Task<IActionResult> GetChapters(int courseId)
    {
        var course = await _courseService.GetByIdAsync(courseId);
        if (course == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewCourseAsync(courseId, userId);

        if (!canView)
            return Forbid();

        var chapters = await _courseService.GetChaptersAsync(courseId);
        var responseChapters = chapters.Select(MapChapterToResponse).ToList();
        return Ok(responseChapters);
    }

    [HttpPost("chapters")]
    public async Task<IActionResult> CreateChapter([FromBody] CreateChapterRequestDto request)
    {
        var course = await _courseService.GetByIdAsync(request.CourseId);
        if (course == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canCreate = await _authService.CanCreateChapterAsync(request.CourseId, userId);

        if (!canCreate)
            return Forbid();

        var chapter = new Entities.Chapter
        {
            CourseId = request.CourseId,
            FamilyId = course.FamilyId,
            CreatedByUserId = userId,
            Title = request.Title,
            OrderIndex = request.OrderIndex,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _courseService.CreateChapterAsync(chapter);
        _logger.LogInformation(
            "Chapter {ChapterId} created by user {UserId} in course {CourseId}",
            created.ChapterId,
            userId,
            request.CourseId
        );

        return CreatedAtAction(
            nameof(GetChapter),
            new { chapterId = created.ChapterId },
            MapChapterToResponse(created)
        );
    }

    [HttpGet("chapters/{chapterId}")]
    public async Task<IActionResult> GetChapter(int chapterId)
    {
        var chapter = await _courseService.GetChapterByIdAsync(chapterId);
        if (chapter == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewChapterAsync(chapterId, userId);

        if (!canView)
            return Forbid();

        return Ok(MapChapterToResponse(chapter));
    }

    [HttpPut("chapters/{chapterId}")]
    public async Task<IActionResult> UpdateChapter(
        int chapterId,
        [FromBody] UpdateChapterRequestDto request
    )
    {
        var chapter = await _courseService.GetChapterByIdAsync(chapterId);
        if (chapter == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canEdit = await _authService.CanEditChapterAsync(chapterId, userId);

        if (!canEdit)
            return Forbid();

        chapter.Title = request.Title;
        chapter.OrderIndex = request.OrderIndex;
        chapter.Description = request.Description;
        chapter.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseService.UpdateChapterAsync(chapterId, chapter);
        _logger.LogInformation("Chapter {ChapterId} updated by user {UserId}", chapterId, userId);

        return Ok(MapChapterToResponse(updated));
    }

    [HttpDelete("chapters/{chapterId}")]
    public async Task<IActionResult> DeleteChapter(int chapterId)
    {
        var chapter = await _courseService.GetChapterByIdAsync(chapterId);
        if (chapter == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canDelete = await _authService.CanDeleteChapterAsync(chapterId, userId);

        if (!canDelete)
            return Forbid();

        await _courseService.DeleteChapterAsync(chapterId);
        _logger.LogInformation("Chapter {ChapterId} deleted by user {UserId}", chapterId, userId);

        return NoContent();
    }

    [HttpGet("chapters/{chapterId}/lessons")]
    public async Task<IActionResult> GetLessons(int chapterId)
    {
        var chapter = await _courseService.GetChapterByIdAsync(chapterId);
        if (chapter == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewChapterAsync(chapterId, userId);

        if (!canView)
            return Forbid();

        var lessons = await _courseService.GetLessonsAsync(chapterId);
        var responseLessons = lessons.Select(MapLessonToResponse).ToList();
        return Ok(responseLessons);
    }

    [HttpGet("lessons/{lessonId}")]
    public async Task<IActionResult> GetLesson(int lessonId)
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);

        if (lesson == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canView = await _authService.CanViewLessonAsync(lessonId, userId);

        if (!canView)
            return Forbid();

        return Ok(MapLessonToResponse(lesson));
    }

    [HttpPost("lessons")]
    public async Task<IActionResult> CreateLesson([FromBody] CreateLessonRequestDto request)
    {
        var chapter = await _courseService.GetChapterByIdAsync(request.ChapterId);
        if (chapter == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canCreate = await _authService.CanCreateLessonAsync(request.ChapterId, userId);

        if (!canCreate)
            return Forbid();

        var lesson = new Entities.Lesson
        {
            ChapterId = request.ChapterId,
            FamilyId = chapter.FamilyId,
            CreatedByUserId = userId,
            Title = request.Title,
            OrderIndex = request.OrderIndex,
            Description = request.Description,
            LearningObjectives = request.LearningObjectives,
            EstimatedMinutes = request.EstimatedMinutes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var created = await _courseService.CreateLessonAsync(lesson);
        _logger.LogInformation(
            "Lesson {LessonId} created by user {UserId} in chapter {ChapterId}",
            created.LessonId,
            userId,
            request.ChapterId
        );

        return CreatedAtAction(
            nameof(GetLesson),
            new { lessonId = created.LessonId },
            MapLessonToResponse(created)
        );
    }

    [HttpPut("lessons/{lessonId}")]
    public async Task<IActionResult> UpdateLesson(
        int lessonId,
        [FromBody] UpdateLessonRequestDto request
    )
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);
        if (lesson == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canEdit = await _authService.CanEditLessonAsync(lessonId, userId);

        if (!canEdit)
            return Forbid();

        lesson.Title = request.Title;
        lesson.OrderIndex = request.OrderIndex;
        lesson.Description = request.Description;
        lesson.LearningObjectives = request.LearningObjectives;
        lesson.EstimatedMinutes = request.EstimatedMinutes;
        lesson.UpdatedAt = DateTime.UtcNow;

        var updated = await _courseService.UpdateLessonAsync(lessonId, lesson);
        _logger.LogInformation("Lesson {LessonId} updated by user {UserId}", lessonId, userId);

        return Ok(MapLessonToResponse(updated));
    }

    [HttpDelete("lessons/{lessonId}")]
    public async Task<IActionResult> DeleteLesson(int lessonId)
    {
        var lesson = await _courseService.GetLessonByIdAsync(lessonId);
        if (lesson == null)
            return NotFound();

        var userId = (int)HttpContext.Items["UserId"]!;
        var canDelete = await _authService.CanDeleteLessonAsync(lessonId, userId);

        if (!canDelete)
            return Forbid();

        await _courseService.DeleteLessonAsync(lessonId);
        _logger.LogInformation("Lesson {LessonId} deleted by user {UserId}", lessonId, userId);

        return NoContent();
    }

    private CourseResponseDto MapCourseToResponse(Entities.Course course)
    {
        return new CourseResponseDto
        {
            CourseId = course.CourseId,
            FamilyId = course.FamilyId,
            Name = course.Name,
            Description = course.Description,
            GradeLevel = course.GradeLevel,
            IconUrl = course.IconUrl,
            ColorCode = course.ColorCode,
            IsActive = course.IsActive,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
            CreatedBy =
                course.CreatedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = course.CreatedBy.UserId,
                        Email = course.CreatedBy.Email,
                        DisplayName = course.CreatedBy.DisplayName,
                    }
                    : new(),
        };
    }

    private ChapterResponseDto MapChapterToResponse(Entities.Chapter chapter)
    {
        return new ChapterResponseDto
        {
            ChapterId = chapter.ChapterId,
            CourseId = chapter.CourseId,
            FamilyId = chapter.FamilyId,
            Title = chapter.Title,
            OrderIndex = chapter.OrderIndex,
            Description = chapter.Description,
            CreatedAt = chapter.CreatedAt,
            UpdatedAt = chapter.UpdatedAt,
            CreatedBy =
                chapter.CreatedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = chapter.CreatedBy.UserId,
                        Email = chapter.CreatedBy.Email,
                        DisplayName = chapter.CreatedBy.DisplayName,
                    }
                    : new(),
        };
    }

    private LessonResponseDto MapLessonToResponse(Entities.Lesson lesson)
    {
        return new LessonResponseDto
        {
            LessonId = lesson.LessonId,
            ChapterId = lesson.ChapterId,
            FamilyId = lesson.FamilyId,
            Title = lesson.Title,
            OrderIndex = lesson.OrderIndex,
            Description = lesson.Description,
            LearningObjectives = lesson.LearningObjectives,
            EstimatedMinutes = lesson.EstimatedMinutes,
            CreatedAt = lesson.CreatedAt,
            UpdatedAt = lesson.UpdatedAt,
            CreatedBy =
                lesson.CreatedBy != null
                    ? new UserDisplayDto
                    {
                        UserId = lesson.CreatedBy.UserId,
                        Email = lesson.CreatedBy.Email,
                        DisplayName = lesson.CreatedBy.DisplayName,
                    }
                    : new(),
        };
    }
}
