namespace SmartPath.Api.Services;

public interface IAuthorizationService
{
    System.Threading.Tasks.Task<bool> CanCreateCourseAsync(int familyId, int userId);
    System.Threading.Tasks.Task<bool> CanEditCourseAsync(int courseId, int userId);
    System.Threading.Tasks.Task<bool> CanDeleteCourseAsync(int courseId, int userId);
    System.Threading.Tasks.Task<bool> CanViewCourseAsync(int courseId, int userId);
    System.Threading.Tasks.Task<List<int>> GetAccessibleCourseIdsAsync(int familyId, int userId);

    System.Threading.Tasks.Task<bool> CanCreateChapterAsync(int courseId, int userId);
    System.Threading.Tasks.Task<bool> CanEditChapterAsync(int chapterId, int userId);
    System.Threading.Tasks.Task<bool> CanDeleteChapterAsync(int chapterId, int userId);
    System.Threading.Tasks.Task<bool> CanViewChapterAsync(int chapterId, int userId);

    System.Threading.Tasks.Task<bool> CanCreateLessonAsync(int chapterId, int userId);
    System.Threading.Tasks.Task<bool> CanEditLessonAsync(int lessonId, int userId);
    System.Threading.Tasks.Task<bool> CanDeleteLessonAsync(int lessonId, int userId);
    System.Threading.Tasks.Task<bool> CanViewLessonAsync(int lessonId, int userId);

    System.Threading.Tasks.Task<bool> CanCreateTaskAsync(int familyId, int userId);
    System.Threading.Tasks.Task<bool> CanEditTaskAsync(int taskId, int userId);
    System.Threading.Tasks.Task<bool> CanDeleteTaskAsync(int taskId, int userId);
    System.Threading.Tasks.Task<bool> CanViewTaskAsync(int taskId, int userId);
    System.Threading.Tasks.Task<bool> CanAssignTaskAsync(int taskId, int userId);
    System.Threading.Tasks.Task<List<int>> GetAccessibleTaskIdsAsync(int familyId, int userId);

    System.Threading.Tasks.Task<bool> IsUserAdminAsync(int userId);
    System.Threading.Tasks.Task<bool> IsFamilyManagerAsync(int familyId, int userId);
    System.Threading.Tasks.Task<bool> IsFamilyMemberAsync(int familyId, int userId);
}
