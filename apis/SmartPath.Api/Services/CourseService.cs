using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Controllers;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class CourseService : ICourseService
{
    private readonly SmartPathDbContext _context;

    public CourseService(SmartPathDbContext context)
    {
        _context = context;
    }

    public async Task<List<Course>> GetAllCoursesAsync(int? gradeLevel = null)
    {
        var query = _context.Courses.Include(c => c.Chapters).Where(c => c.IsActive);

        if (gradeLevel.HasValue)
        {
            query = query.Where(c => c.GradeLevel == gradeLevel.Value);
        }

        return await query.OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<Course?> GetByIdAsync(int courseId)
    {
        return await _context
            .Courses.Include(c => c.Chapters)
            .ThenInclude(ch => ch.Lessons)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);
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

    public async System.Threading.Tasks.Task<Chapter> CreateChapterAsync(CreateChapterRequest request)
    {
        var maxOrderIndex = await _context
            .Chapters.Where(c => c.CourseId == request.CourseId)
            .MaxAsync(c => (int?)c.OrderIndex) ?? 0;

        var chapter = new Chapter
        {
            CourseId = request.CourseId,
            Title = request.Title,
            Description = request.Description,
            OrderIndex = maxOrderIndex + 1,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();

        return chapter;
    }

    public async System.Threading.Tasks.Task<Chapter> UpdateChapterAsync(
        int chapterId,
        UpdateChapterRequest request
    )
    {
        var chapter = await _context.Chapters.FindAsync(chapterId);
        if (chapter == null)
            throw new KeyNotFoundException($"Chapter {chapterId} not found");

        if (request.Title != null)
            chapter.Title = request.Title;
        if (request.Description != null)
            chapter.Description = request.Description;
        if (request.OrderIndex.HasValue)
            chapter.OrderIndex = request.OrderIndex.Value;

        _context.Chapters.Update(chapter);
        await _context.SaveChangesAsync();

        return chapter;
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

    public async Task<List<Lesson>> GetLessonsAsync(int chapterId)
    {
        return await _context
            .Lessons.Include(l => l.PracticeItems)
            .Where(l => l.ChapterId == chapterId)
            .OrderBy(l => l.OrderIndex)
            .ToListAsync();
    }

    public async Task<Lesson?> GetLessonByIdAsync(int lessonId)
    {
        return await _context
            .Lessons.Include(l => l.PracticeItems)
            .Include(l => l.Chapter)
            .ThenInclude(c => c.Course)
            .FirstOrDefaultAsync(l => l.LessonId == lessonId);
    }

    public async System.Threading.Tasks.Task<Course> CreateCourseAsync(CreateCourseRequest request)
    {
        var course = new Course
        {
            Name = request.Name,
            Description = request.Description,
            GradeLevel = request.GradeLevel,
            ColorCode = request.ColorCode,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return course;
    }

    public async System.Threading.Tasks.Task<Course> UpdateCourseAsync(
        int courseId,
        UpdateCourseRequest request
    )
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course == null)
            throw new KeyNotFoundException($"Course {courseId} not found");

        if (request.Name != null)
            course.Name = request.Name;
        if (request.Description != null)
            course.Description = request.Description;
        if (request.GradeLevel.HasValue)
            course.GradeLevel = request.GradeLevel.Value;
        if (request.ColorCode != null)
            course.ColorCode = request.ColorCode;

        _context.Courses.Update(course);
        await _context.SaveChangesAsync();

        return course;
    }

    public async System.Threading.Tasks.Task DeleteCourseAsync(int courseId)
    {
        var course = await _context.Courses.FindAsync(courseId);
        if (course != null)
        {
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
        }
    }

    public async System.Threading.Tasks.Task DeleteBulkCoursesAsync(List<int> courseIds)
    {
        var courses = await _context
            .Courses.Where(c => courseIds.Contains(c.CourseId))
            .ToListAsync();

        _context.Courses.RemoveRange(courses);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<Lesson> CreateLessonAsync(CreateLessonRequest request)
    {
        var lesson = new Lesson
        {
            ChapterId = request.ChapterId,
            Title = request.Title,
            Description = request.Content,
            OrderIndex = request.OrderIndex,
            CreatedAt = DateTime.UtcNow,
        };

        _context.Lessons.Add(lesson);
        await _context.SaveChangesAsync();

        return lesson;
    }

    public async System.Threading.Tasks.Task<Lesson> UpdateLessonAsync(
        int lessonId,
        UpdateLessonRequest request
    )
    {
        var lesson = await _context.Lessons.FindAsync(lessonId);
        if (lesson == null)
            throw new KeyNotFoundException($"Lesson {lessonId} not found");

        if (request.Title != null)
            lesson.Title = request.Title;
        if (request.Content != null)
            lesson.Description = request.Content;
        if (request.OrderIndex.HasValue)
            lesson.OrderIndex = request.OrderIndex.Value;

        _context.Lessons.Update(lesson);
        await _context.SaveChangesAsync();

        return lesson;
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
