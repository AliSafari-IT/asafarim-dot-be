using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Controllers;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class CourseService : ICourseService
{
    private readonly SmartPathDbContext _context;
    private readonly ILogger<CourseService> _logger;

    public CourseService(SmartPathDbContext context, ILogger<CourseService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<List<Course>> GetAllCoursesAsync(int? gradeLevel = null)
    {
        var query = _context.Courses
            .Include(c => c.Chapters)
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
            .Courses
            .Include(c => c.Chapters)
            .ThenInclude(ch => ch.Lessons)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.CourseId == courseId);
    }

    public async System.Threading.Tasks.Task<Course> CreateAsync(Course course)
    {
        course.CreatedAt = DateTime.UtcNow;
        course.UpdatedAt = DateTime.UtcNow;
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async System.Threading.Tasks.Task<Course> UpdateAsync(Course course)
    {
        course.UpdatedAt = DateTime.UtcNow;
        _context.Courses.Update(course);
        await _context.SaveChangesAsync();
        return course;
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
        var courses = await _context.Courses
            .Where(c => courseIds.Contains(c.CourseId))
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
        _context.Chapters.Add(chapter);
        await _context.SaveChangesAsync();
        return chapter;
    }

    public async System.Threading.Tasks.Task<Chapter> UpdateChapterAsync(int chapterId, Chapter chapter)
    {
        chapter.ChapterId = chapterId;
        chapter.UpdatedAt = DateTime.UtcNow;
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

    public async System.Threading.Tasks.Task<List<Lesson>> GetLessonsAsync(int chapterId)
    {
        return await _context
            .Lessons
            .Include(l => l.PracticeItems)
            .Include(l => l.CreatedBy)
            .Where(l => l.ChapterId == chapterId)
            .OrderBy(l => l.OrderIndex)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<Lesson?> GetLessonByIdAsync(int lessonId)
    {
        return await _context
            .Lessons
            .Include(l => l.PracticeItems)
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
        lesson.LessonId = lessonId;
        lesson.UpdatedAt = DateTime.UtcNow;
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
