using Core.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Core.Api;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    // Add your DbSet properties here as needed
    public DbSet<JobApplication> JobApplications { get; set; } = null!;
    public DbSet<TimelineMilestone> TimelineMilestones { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure JobApplication entity for Jobs database
        modelBuilder.Entity<JobApplication>(entity =>
        {
            entity.HasKey(j => j.Id);
            entity.ToTable("JobApplications", "public"); // Specify schema

            entity.Property(j => j.Status).HasMaxLength(50).IsRequired();

            entity.Property(j => j.Company).HasMaxLength(100).IsRequired();

            entity.Property(j => j.Role).HasMaxLength(100).IsRequired();
        });

        // Configure TimelineMilestone entity
        modelBuilder.Entity<TimelineMilestone>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.ToTable("TimelineMilestones", "public");

            entity.Property(t => t.Type).HasMaxLength(100).IsRequired();

            entity.Property(t => t.Title).HasMaxLength(200).IsRequired();

            entity.Property(t => t.Status).HasMaxLength(50).IsRequired();

            entity.Property(t => t.Color).HasMaxLength(7).IsRequired();

            entity.Property(t => t.Icon).HasMaxLength(10).IsRequired();

            // Configure relationship with JobApplication
            entity
                .HasOne(t => t.JobApplication)
                .WithMany()
                .HasForeignKey(t => t.JobApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
