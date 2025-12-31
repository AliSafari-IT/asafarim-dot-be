using SmartPath.Api.Entities;
using SmartPath.Api.Controllers;

namespace SmartPath.Api.Services;

public interface ICourseService
{
    System.Threading.Tasks.Task<List<Course>> GetAllCoursesAsync(int? gradeLevel = null);
    System.Threading.Tasks.Task<Course?> GetByIdAsync(int courseId);
    System.Threading.Tasks.Task<Course> CreateAsync(Course course);
    System.Threading.Tasks.Task<Course> UpdateAsync(Course course);
    System.Threading.Tasks.Task DeleteAsync(int courseId);
    System.Threading.Tasks.Task DeleteBulkAsync(List<int> courseIds);
    System.Threading.Tasks.Task<List<Chapter>> GetChaptersAsync(int courseId);
    System.Threading.Tasks.Task<Chapter?> GetChapterByIdAsync(int chapterId);
    System.Threading.Tasks.Task<Chapter> CreateChapterAsync(Chapter chapter);
    System.Threading.Tasks.Task<Chapter> UpdateChapterAsync(int chapterId, Chapter chapter);
    System.Threading.Tasks.Task DeleteChapterAsync(int chapterId);
    System.Threading.Tasks.Task<List<Lesson>> GetLessonsAsync(int chapterId);
    System.Threading.Tasks.Task<Lesson?> GetLessonByIdAsync(int lessonId);
    System.Threading.Tasks.Task<Lesson> CreateLessonAsync(Lesson lesson);
    System.Threading.Tasks.Task<Lesson> UpdateLessonAsync(int lessonId, Lesson lesson);
    System.Threading.Tasks.Task DeleteLessonAsync(int lessonId);
}
