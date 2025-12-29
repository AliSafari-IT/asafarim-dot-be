using Microsoft.EntityFrameworkCore;
using SmartPath.Api.Entities;

namespace SmartPath.Api.Data;

public class SmartPathDbContext : DbContext
{
    public SmartPathDbContext(DbContextOptions<SmartPathDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Family> Families { get; set; }
    public DbSet<FamilyMember> FamilyMembers { get; set; }
    public DbSet<Entities.Task> Tasks { get; set; }
    public DbSet<TaskComment> TaskComments { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Chapter> Chapters { get; set; }
    public DbSet<Lesson> Lessons { get; set; }
    public DbSet<PracticeItem> PracticeItems { get; set; }
    public DbSet<ChildCourseEnrollment> ChildCourseEnrollments { get; set; }
    public DbSet<LessonProgress> LessonProgress { get; set; }
    public DbSet<PracticeAttempt> PracticeAttempts { get; set; }
    public DbSet<Achievement> Achievements { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<Streak> Streaks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configurations
        modelBuilder.Entity<User>().HasIndex(u => u.IdentityUserId).IsUnique();

        modelBuilder.Entity<User>().HasIndex(u => u.Email);

        // Family configurations
        modelBuilder
            .Entity<Family>()
            .HasOne(f => f.CreatedBy)
            .WithMany()
            .HasForeignKey(f => f.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // FamilyMember configurations
        modelBuilder
            .Entity<FamilyMember>()
            .HasIndex(fm => new { fm.FamilyId, fm.UserId })
            .IsUnique();

        modelBuilder
            .Entity<FamilyMember>()
            .HasOne(fm => fm.Family)
            .WithMany(f => f.Members)
            .HasForeignKey(fm => fm.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<FamilyMember>()
            .HasOne(fm => fm.User)
            .WithMany(u => u.FamilyMemberships)
            .HasForeignKey(fm => fm.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Task configurations
        modelBuilder
            .Entity<Entities.Task>()
            .HasOne(t => t.Family)
            .WithMany(f => f.Tasks)
            .HasForeignKey(t => t.FamilyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Entities.Task>()
            .HasOne(t => t.AssignedTo)
            .WithMany()
            .HasForeignKey(t => t.AssignedToUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<Entities.Task>()
            .HasOne(t => t.CreatedBy)
            .WithMany()
            .HasForeignKey(t => t.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Entities.Task>().HasIndex(t => t.DueDate);

        modelBuilder.Entity<Entities.Task>().HasIndex(t => t.Status);

        // TaskComment configurations
        modelBuilder
            .Entity<TaskComment>()
            .HasKey(tc => tc.CommentId);

        modelBuilder
            .Entity<TaskComment>()
            .HasOne(tc => tc.Task)
            .WithMany(t => t.Comments)
            .HasForeignKey(tc => tc.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        // Course/Chapter/Lesson configurations
        modelBuilder
            .Entity<Chapter>()
            .HasOne(c => c.Course)
            .WithMany(co => co.Chapters)
            .HasForeignKey(c => c.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<Lesson>()
            .HasOne(l => l.Chapter)
            .WithMany(c => c.Lessons)
            .HasForeignKey(l => l.ChapterId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<PracticeItem>()
            .HasOne(pi => pi.Lesson)
            .WithMany(l => l.PracticeItems)
            .HasForeignKey(pi => pi.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        // Enrollment configurations
        modelBuilder.Entity<ChildCourseEnrollment>().HasKey(e => e.EnrollmentId);

        modelBuilder
            .Entity<ChildCourseEnrollment>()
            .HasOne(e => e.Child)
            .WithMany()
            .HasForeignKey(e => e.ChildUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<ChildCourseEnrollment>()
            .HasOne(e => e.Course)
            .WithMany(c => c.Enrollments)
            .HasForeignKey(e => e.CourseId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<ChildCourseEnrollment>()
            .HasIndex(e => new { e.ChildUserId, e.CourseId })
            .IsUnique();

        // Progress configurations
        modelBuilder.Entity<LessonProgress>().HasKey(lp => lp.ProgressId);

        modelBuilder
            .Entity<LessonProgress>()
            .HasOne(lp => lp.Child)
            .WithMany()
            .HasForeignKey(lp => lp.ChildUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<LessonProgress>()
            .HasOne(lp => lp.Lesson)
            .WithMany(l => l.ProgressRecords)
            .HasForeignKey(lp => lp.LessonId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<LessonProgress>()
            .HasIndex(lp => new { lp.ChildUserId, lp.LessonId })
            .IsUnique();

        modelBuilder.Entity<LessonProgress>().HasIndex(lp => lp.NextReviewDate);

        // Practice attempt configurations
        modelBuilder.Entity<PracticeAttempt>().HasKey(pa => pa.AttemptId);

        modelBuilder
            .Entity<PracticeAttempt>()
            .HasOne(pa => pa.Child)
            .WithMany()
            .HasForeignKey(pa => pa.ChildUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<PracticeAttempt>()
            .HasOne(pa => pa.PracticeItem)
            .WithMany(pi => pi.Attempts)
            .HasForeignKey(pa => pa.PracticeItemId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<PracticeAttempt>().HasIndex(pa => pa.AttemptedAt);

        // Achievement configurations
        modelBuilder.Entity<UserAchievement>().HasKey(ua => ua.UserAchievementId);

        modelBuilder
            .Entity<UserAchievement>()
            .HasOne(ua => ua.User)
            .WithMany()
            .HasForeignKey(ua => ua.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<UserAchievement>()
            .HasOne(ua => ua.Achievement)
            .WithMany(a => a.UserAchievements)
            .HasForeignKey(ua => ua.AchievementId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder
            .Entity<UserAchievement>()
            .HasIndex(ua => new { ua.UserId, ua.AchievementId })
            .IsUnique();

        // Streak configurations
        modelBuilder.Entity<Streak>().HasKey(s => s.StreakId);

        modelBuilder
            .Entity<Streak>()
            .HasOne(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Streak>().HasIndex(s => s.UserId).IsUnique();

        // Decimal precision for mastery and progress
        modelBuilder.Entity<LessonProgress>().Property(lp => lp.MasteryLevel).HasPrecision(5, 2);

        modelBuilder
            .Entity<ChildCourseEnrollment>()
            .Property(e => e.OverallProgress)
            .HasPrecision(5, 2);

        modelBuilder
            .Entity<ChildCourseEnrollment>()
            .Property(e => e.AverageMastery)
            .HasPrecision(5, 2);
    }
}
