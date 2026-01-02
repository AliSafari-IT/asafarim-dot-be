using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Controllers;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;
using SmartPath.Api.Services.ContentSanitization;

namespace SmartPath.Api.Services;

public class CourseService : ICourseService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<CourseService> _logger;
    private readonly IHtmlContentSanitizer _sanitizer;

    public CourseService(
        SmartPathDbContext context,
        ILogger<CourseService> logger,
        IHtmlContentSanitizer sanitizer
    )
    {
        _context = context;
        _logger = logger;
        _sanitizer = sanitizer;
    }

    public async System.Threading.Tasks.Task<List<Course>> GetAllCoursesAsync(
        int? gradeLevel = null
    )
    {
        var query = _context
            .Courses.Include(c => c.Chapters)
            .Include(c => c.CreatedBy)
            .Where(c => c.IsActive);

        if (gradeLevel.HasValue)
        {
            query = query.Where(c => c.GradeLevel == gradeLevel.Value);
        }

        return await query.OrderBy(c => c.Name).ToListAsync();
    }

    public async System.Threading.Tasks.Task<Course?> GetByIdAsync(int courseId)
    {
        return await _context
            .Courses.Include(c => c.Chapters)
            .ThenInclude(ch => ch.Lessons)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);
    }

    public async System.Threading.Tasks.Task<Course> CreateAsync(Course course)
    {
        course.CreatedAt = DateTime.UtcNow;
        course.UpdatedAt = DateTime.UtcNow;

        // Handle rich text fields
        if (!string.IsNullOrEmpty(course.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                course.DescriptionJson,
                course.DescriptionHtml,
                "DescriptionJson/Html"
            );
            course.DescriptionHtml = _sanitizer.SanitizeArticleHtml(course.DescriptionHtml);
        }

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async System.Threading.Tasks.Task<Course> UpdateAsync(Course course)
    {
        var existing = await _context.Courses.FirstOrDefaultAsync(c =>
            c.CourseId == course.CourseId
        );
        if (existing == null)
            throw new InvalidOperationException("Course not found");

        existing.Name = course.Name;
        existing.Description = course.Description;
        existing.GradeLevel = course.GradeLevel;
        existing.ColorCode = course.ColorCode;
        existing.IsActive = course.IsActive;
        existing.UpdatedAt = DateTime.UtcNow;

        // Handle rich text fields - only update if rich text is provided
        _logger.LogInformation(
            "UpdateAsync - DescriptionHtml: {DescriptionHtml}, DescriptionJson: {DescriptionJson}, Description: {Description}",
            course.DescriptionHtml ?? "(null)",
            course.DescriptionJson ?? "(null)",
            course.Description ?? "(null)"
        );

        if (!string.IsNullOrEmpty(course.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                course.DescriptionJson,
                course.DescriptionHtml,
                "DescriptionJson/Html"
            );
            existing.DescriptionJson = course.DescriptionJson;
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(course.DescriptionHtml);
            existing.Description = null; // Clear plain text when using rich text
            _logger.LogInformation(
                "UpdateAsync - Saved DescriptionHtml: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        else if (!string.IsNullOrEmpty(course.Description))
        {
            var html = $"<p>{System.Net.WebUtility.HtmlEncode(course.Description)}</p>";
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(html);
            existing.DescriptionJson = null;
            _logger.LogInformation(
                "UpdateAsync - Converted Description to HTML: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        // If neither rich text nor plain description provided, keep existing values
        // (don't log this as an error - it's valid to update other fields without description)

        await _context.SaveChangesAsync();
        return existing;
    }

    public async System.Threading.Tasks.Task DeleteAsync(int courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course != null)
        {
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task DeleteBulkAsync(List<int> courseIds)
    {
        var courses = await _context
            .Courses.Where(c => courseIds.Contains(c.CourseId))
            .ToListAsync();
        _context.Courses.RemoveRange(courses);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<List<Chapter>> GetChaptersAsync(int courseId)
    {
        return await _context
            .Chapters.Include(c => c.Lessons)
            .Where(c => c.CourseId == courseId)
            .OrderBy(c => c.OrderIndex)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<Chapter?> GetChapterByIdAsync(int chapterId)
    {
        return await _context
            .Chapters.Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.ChapterId == chapterId);
    }

    public async System.Threading.Tasks.Task<Chapter> CreateChapterAsync(Chapter chapter)
    {
        chapter.CreatedAt = DateTime.UtcNow;
        chapter.UpdatedAt = DateTime.UtcNow;

        // Handle rich text fields
        if (!string.IsNullOrEmpty(chapter.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                chapter.DescriptionJson,
                chapter.DescriptionHtml,
                "DescriptionJson/Html"
            );
            chapter.DescriptionHtml = _sanitizer.SanitizeArticleHtml(chapter.DescriptionHtml);
        }

        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();
        return chapter;
    }

    public async System.Threading.Tasks.Task<Chapter> UpdateChapterAsync(
        int chapterId,
        Chapter chapter
    )
    {
        var existing = await _context.Chapters.FirstOrDefaultAsync(c => c.ChapterId == chapterId);
        if (existing == null)
            throw new InvalidOperationException("Chapter not found");

        existing.Title = chapter.Title;
        existing.OrderIndex = chapter.OrderIndex;
        existing.Description = chapter.Description;
        existing.UpdatedAt = DateTime.UtcNow;

        // Handle rich text fields - only update if rich text is provided
        _logger.LogInformation(
            "UpdateChapterAsync - DescriptionHtml: {DescriptionHtml}, DescriptionJson: {DescriptionJson}, Description: {Description}",
            chapter.DescriptionHtml ?? "(null)",
            chapter.DescriptionJson ?? "(null)",
            chapter.Description ?? "(null)"
        );

        // Debug: Check the actual values
        _logger.LogInformation(
            "UpdateChapterAsync DEBUG - DescriptionHtml length: {Length}, IsNullOrEmpty: {IsNullOrEmpty}",
            chapter.DescriptionHtml?.Length ?? 0,
            string.IsNullOrEmpty(chapter.DescriptionHtml)
        );

        if (!string.IsNullOrEmpty(chapter.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                chapter.DescriptionJson,
                chapter.DescriptionHtml,
                "DescriptionJson/Html"
            );
            existing.DescriptionJson = chapter.DescriptionJson;
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(chapter.DescriptionHtml);
            existing.Description = null; // Clear plain text when using rich text
            _logger.LogInformation(
                "UpdateChapterAsync - Saved DescriptionHtml: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        else if (!string.IsNullOrEmpty(chapter.Description))
        {
            var html = $"<p>{System.Net.WebUtility.HtmlEncode(chapter.Description)}</p>";
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(html);
            existing.DescriptionJson = null;
            _logger.LogInformation(
                "UpdateChapterAsync - Converted Description to HTML: {DescriptionHtml}",
                existing.DescriptionHtml ?? "(null)"
            );
        }
        // If neither rich text nor plain description provided, keep existing values
        // (don't log this as an error - it's valid to update other fields without description)

        await _context.SaveChangesAsync();
        return existing;
    }

    public async System.Threading.Tasks.Task DeleteChapterAsync(int chapterId)
    {
        var chapter = await _context.Chapters.FindAsync(chapterId);
        if (chapter != null)
        {
            _context.Chapters.Remove(chapter);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task<List<Lesson>> GetLessonsAsync(int chapterId)
    {
        return await _context
            .Lessons.Include(l => l.PracticeItems)
            .Include(l => l.CreatedBy)
            .Where(l => l.ChapterId == chapterId)
            .OrderBy(l => l.OrderIndex)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<Lesson?> GetLessonByIdAsync(int lessonId)
    {
        return await _context
            .Lessons.Include(l => l.PracticeItems)
            .Include(l => l.Chapter)
            .ThenInclude(c => c.Course)
            .Include(l => l.CreatedBy)
            .FirstOrDefaultAsync(l => l.LessonId == lessonId);
    }

    public async System.Threading.Tasks.Task<Lesson> CreateLessonAsync(Lesson lesson)
    {
        lesson.CreatedAt = DateTime.UtcNow;
        lesson.UpdatedAt = DateTime.UtcNow;
        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();
        return lesson;
    }

    public async System.Threading.Tasks.Task<Lesson> UpdateLessonAsync(int lessonId, Lesson lesson)
    {
        var existing = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == lessonId);
        if (existing == null)
            throw new InvalidOperationException("Lesson not found");

        existing.Title = lesson.Title;
        existing.OrderIndex = lesson.OrderIndex;
        existing.Description = lesson.Description;
        existing.LearningObjectives = lesson.LearningObjectives;
        existing.EstimatedMinutes = lesson.EstimatedMinutes;

        // Handle rich text fields
        if (!string.IsNullOrEmpty(lesson.DescriptionHtml))
        {
            _sanitizer.ValidateContentSize(
                lesson.DescriptionJson,
                lesson.DescriptionHtml,
                "DescriptionJson/Html"
            );
            existing.DescriptionJson = lesson.DescriptionJson;
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(lesson.DescriptionHtml);
        }
        else if (!string.IsNullOrEmpty(lesson.Description))
        {
            // Fallback: convert legacy text to HTML
            var html = $"<p>{System.Net.WebUtility.HtmlEncode(lesson.Description)}</p>";
            existing.DescriptionHtml = _sanitizer.SanitizeArticleHtml(html);
            existing.DescriptionJson = null;
        }

        if (!string.IsNullOrEmpty(lesson.LearningObjectivesHtml))
        {
            _sanitizer.ValidateContentSize(
                lesson.LearningObjectivesJson,
                lesson.LearningObjectivesHtml,
                "LearningObjectivesJson/Html"
            );
            existing.LearningObjectivesJson = lesson.LearningObjectivesJson;
            existing.LearningObjectivesHtml = _sanitizer.SanitizeArticleHtml(
                lesson.LearningObjectivesHtml
            );
        }
        else if (!string.IsNullOrEmpty(lesson.LearningObjectives))
        {
            // Fallback: convert legacy text to HTML
            var html = $"<p>{System.Net.WebUtility.HtmlEncode(lesson.LearningObjectives)}</p>";
            existing.LearningObjectivesHtml = _sanitizer.SanitizeArticleHtml(html);
            existing.LearningObjectivesJson = null;
        }

        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async System.Threading.Tasks.Task DeleteLessonAsync(int lessonId)
    {
        var lesson = await _context.Lessons.FindAsync(lessonId);
        if (lesson != null)
        {
            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
        }
    }
}
