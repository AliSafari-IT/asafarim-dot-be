using SmartPath.Api.Entities;
using SmartPath.Api.Controllers;

namespace SmartPath.Api.Services;

public interface ICourseService
{
    System.Threading.Tasks.Task<List<Course>> GetAllCoursesAsync(int? gradeLevel = null);
    System.Threading.Tasks.Task<Course?> GetByIdAsync(int courseId);
    System.Threading.Tasks.Task<Course> CreateCourseAsync(CreateCourseRequest request);
    System.Threading.Tasks.Task<Course> UpdateCourseAsync(int courseId, UpdateCourseRequest request);
    System.Threading.Tasks.Task DeleteCourseAsync(int courseId);
    System.Threading.Tasks.Task DeleteBulkCoursesAsync(List<int> courseIds);
    System.Threading.Tasks.Task<List<Chapter>> GetChaptersAsync(int courseId);
    System.Threading.Tasks.Task<Chapter?> GetChapterByIdAsync(int chapterId);
    System.Threading.Tasks.Task<Chapter> CreateChapterAsync(CreateChapterRequest request);
    System.Threading.Tasks.Task<Chapter> UpdateChapterAsync(int chapterId, UpdateChapterRequest request);
    System.Threading.Tasks.Task DeleteChapterAsync(int chapterId);
    System.Threading.Tasks.Task<List<Lesson>> GetLessonsAsync(int chapterId);
    System.Threading.Tasks.Task<Lesson?> GetLessonByIdAsync(int lessonId);
    System.Threading.Tasks.Task<Lesson> CreateLessonAsync(CreateLessonRequest request);
    System.Threading.Tasks.Task<Lesson> UpdateLessonAsync(int lessonId, UpdateLessonRequest request);
    System.Threading.Tasks.Task DeleteLessonAsync(int lessonId);
}
