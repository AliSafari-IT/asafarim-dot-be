using System.Collections.Generic;
using System.Linq;
using Core.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Core.Api.Data;

public class CoreDbContext : DbContext
{
    public CoreDbContext(DbContextOptions<CoreDbContext> options)
        : base(options) { }

    public DbSet<Contact> Contacts { get; set; } = null!;
    public DbSet<UserConversation> UserConversations { get; set; } = null!;
    public DbSet<ConversationMessage> ConversationMessages { get; set; } = null!;
    public DbSet<MessageAttachment> MessageAttachments { get; set; } = null!;
    public DbSet<MessageLink> MessageLinks { get; set; } = null!;
    public DbSet<ProjectInquiry> ProjectInquiries { get; set; } = null!;
    public DbSet<ProjectInquiryMessage> ProjectInquiryMessages { get; set; } = null!;
    public DbSet<Publication> Publications { get; set; } = null!;
    public DbSet<PublicationMetric> PublicationMetrics { get; set; } = null!;
    public DbSet<WorkExperience> WorkExperiences { get; set; } = null!;
    public DbSet<WorkAchievement> WorkAchievements { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.EmailSent).HasDefaultValue(false);
        });

        modelBuilder.Entity<UserConversation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity
                .HasMany(e => e.Messages)
                .WithOne()
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ConversationMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity
                .HasMany(e => e.Attachments)
                .WithOne()
                .HasForeignKey(e => e.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
            entity
                .HasMany(e => e.Links)
                .WithOne()
                .HasForeignKey(e => e.MessageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MessageAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<MessageLink>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<ProjectInquiry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity
                .HasMany(e => e.Messages)
                .WithOne()
                .HasForeignKey(e => e.ProjectInquiryId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProjectInquiryMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Publication>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.Variant).HasMaxLength(50);
            entity.Property(e => e.Year).HasMaxLength(10);
            entity.Property(e => e.DOI).HasMaxLength(100);
            entity.Property(e => e.PublicationType).HasMaxLength(50);

            // Configure Tags as PostgreSQL array instead of JSON
            entity
                .Property(e => e.Tags)
                .HasColumnType("text[]")
                .HasConversion(v => v, v => v == null ? new List<string>() : v.ToList())
                .Metadata.SetValueComparer(
                    new ValueComparer<List<string>>(
                        (c1, c2) => c1 != null && c2 != null && c1.SequenceEqual(c2),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()
                    )
                );
            // Configure one-to-many relationship with PublicationMetric
            entity
                .HasMany(e => e.Metrics)
                .WithOne(m => m.Publication)
                .HasForeignKey(m => m.PublicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PublicationMetric>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Label).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Value).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<WorkExperience>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("WorkExperiences", "public");

            entity.Property(e => e.JobTitle).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Location).HasMaxLength(100);

            entity.Property(e => e.Description).HasMaxLength(2000);

            entity.Property(e => e.StartDate).IsRequired();
            entity.Property(e => e.EndDate);

            entity.Property(e => e.IsCurrent).HasDefaultValue(false);
            entity.Property(e => e.IsPublished).HasDefaultValue(true);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            // one-to-many relationship with WorkAchievement
            entity
                .HasMany(e => e.Achievements)
                .WithOne(a => a.WorkExperience)
                .HasForeignKey(a => a.WorkExperienceId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkAchievement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.ToTable("WorkAchievements", "public");
            entity.Property(e => e.Text).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });
    }
}
