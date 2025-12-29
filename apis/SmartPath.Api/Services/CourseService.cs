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

    public async Task<List<Chapter>> GetChaptersAsync(int courseId)
    {
        return await _context
            .Chapters.Include(c => c.Lessons)
            .Where(c => c.CourseId == courseId)
            .OrderBy(c => c.OrderIndex)
            .ToListAsync();
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
