using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Data;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Services;

public class AuthorizationService : IAuthorizationService
{
    private readonly SmartPathDbContext _context;
    private readonly IFamilyService _familyService;
    private readonly ILogger<AuthorizationService> _logger;

    public AuthorizationService(
        SmartPathDbContext context,
        IFamilyService familyService,
        ILogger<AuthorizationService> logger
    )
    {
        _context = context;
        _familyService = familyService;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task<bool> IsUserAdminAsync(int userId)
    {
        return false;
    }

    public async System.Threading.Tasks.Task<bool> IsFamilyManagerAsync(int familyId, int userId)
    {
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );
        return member?.Role == "familyManager";
    }

    public async System.Threading.Tasks.Task<bool> IsFamilyMemberAsync(int familyId, int userId)
    {
        var member = await _context.FamilyMembers.FirstOrDefaultAsync(fm =>
            fm.FamilyId == familyId && fm.UserId == userId
        );
        return member != null;
    }

    public async System.Threading.Tasks.Task<bool> CanCreateCourseAsync(int familyId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var isMember = await IsFamilyMemberAsync(familyId, userId);
        return isMember;
    }

    public async System.Threading.Tasks.Task<bool> CanEditCourseAsync(int courseId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null)
            return false;

        var isCreator = course.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isManager = await IsFamilyManagerAsync(course.FamilyId, userId);
        return false;
    }

    public async System.Threading.Tasks.Task<bool> CanDeleteCourseAsync(int courseId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null)
            return false;

        return course.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanViewCourseAsync(int courseId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null)
            return false;

        var isCreator = course.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isManager = await IsFamilyManagerAsync(course.FamilyId, userId);
        if (isManager)
            return true;

        // Allow viewing if user is enrolled in the course
        var isEnrolled = await _context.ChildCourseEnrollments.AnyAsync(ce =>
            ce.CourseId == courseId && ce.ChildUserId == userId
        );
        return isEnrolled;
    }

    public async System.Threading.Tasks.Task<List<int>> GetAccessibleCourseIdsAsync(
        int familyId,
        int userId
    )
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
        {
            return await _context
                .Courses.Where(c => c.FamilyId == familyId)
                .Select(c => c.CourseId)
                .ToListAsync();
        }

        var isManager = await IsFamilyManagerAsync(familyId, userId);
        if (isManager)
        {
            return await _context
                .Courses.Where(c => c.FamilyId == familyId)
                .Select(c => c.CourseId)
                .ToListAsync();
        }

        return await _context
            .Courses.Where(c => c.FamilyId == familyId && c.CreatedByUserId == userId)
            .Select(c => c.CourseId)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<bool> CanCreateChapterAsync(int courseId, int userId)
    {
        var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
        if (course == null)
            return false;

        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        return course.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanEditChapterAsync(int chapterId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.ChapterId == chapterId);
        if (chapter == null)
            return false;

        return chapter.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanDeleteChapterAsync(int chapterId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.ChapterId == chapterId);
        if (chapter == null)
            return false;

        return chapter.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanViewChapterAsync(int chapterId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.ChapterId == chapterId);
        if (chapter == null)
            return false;

        var isCreator = chapter.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isManager = await IsFamilyManagerAsync(chapter.FamilyId, userId);
        return isManager;
    }

    public async System.Threading.Tasks.Task<bool> CanCreateLessonAsync(int chapterId, int userId)
    {
        var chapter = await _context.Chapters.FirstOrDefaultAsync(ch => ch.ChapterId == chapterId);
        if (chapter == null)
            return false;

        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        return chapter.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanEditLessonAsync(int lessonId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == lessonId);
        if (lesson == null)
            return false;

        return lesson.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanDeleteLessonAsync(int lessonId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == lessonId);
        if (lesson == null)
            return false;

        return lesson.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanViewLessonAsync(int lessonId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var lesson = await _context.Lessons.FirstOrDefaultAsync(l => l.LessonId == lessonId);
        if (lesson == null)
            return false;

        var isCreator = lesson.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isManager = await IsFamilyManagerAsync(lesson.FamilyId, userId);
        return isManager;
    }

    public async System.Threading.Tasks.Task<bool> CanCreateTaskAsync(int familyId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var isMember = await IsFamilyMemberAsync(familyId, userId);
        return isMember;
    }

    public async System.Threading.Tasks.Task<bool> CanEditTaskAsync(int taskId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null)
            return false;

        var isCreator = task.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isManager = await IsFamilyManagerAsync(task.FamilyId, userId);
        return isManager;
    }

    public async System.Threading.Tasks.Task<bool> CanDeleteTaskAsync(int taskId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null)
            return false;

        return task.CreatedByUserId == userId;
    }

    public async System.Threading.Tasks.Task<bool> CanViewTaskAsync(int taskId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null)
            return false;

        var isCreator = task.CreatedByUserId == userId;
        if (isCreator)
            return true;

        var isAssignee = task.AssignedToUserId == userId;
        if (isAssignee)
            return true;

        var isManager = await IsFamilyManagerAsync(task.FamilyId, userId);
        return isManager;
    }

    public async System.Threading.Tasks.Task<List<int>> GetAccessibleTaskIdsAsync(
        int familyId,
        int userId
    )
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
        {
            return await _context
                .Tasks.Where(t => t.FamilyId == familyId)
                .Select(t => t.TaskId)
                .ToListAsync();
        }

        var isManager = await IsFamilyManagerAsync(familyId, userId);
        if (isManager)
        {
            return await _context
                .Tasks.Where(t => t.FamilyId == familyId)
                .Select(t => t.TaskId)
                .ToListAsync();
        }

        return await _context
            .Tasks.Where(t =>
                t.FamilyId == familyId
                && (t.CreatedByUserId == userId || t.AssignedToUserId == userId)
            )
            .Select(t => t.TaskId)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<bool> CanAssignTaskAsync(int taskId, int userId)
    {
        var isAdmin = await IsUserAdminAsync(userId);
        if (isAdmin)
            return true;

        var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        if (task == null)
            return false;

        var isManager = await IsFamilyManagerAsync(task.FamilyId, userId);
        return isManager;
    }
}
