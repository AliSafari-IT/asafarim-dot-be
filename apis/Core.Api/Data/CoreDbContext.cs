using System.Collections.Generic;
using System.Linq;
using Core.Api.Models;
using Core.Api.Models.Resume;
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

    // Resume entities
    public DbSet<Resume> Resumes { get; set; } = null!;
    public DbSet<ContactInfo> ContactInfos { get; set; } = null!;
    public DbSet<Skill> Skills { get; set; } = null!;
    public DbSet<Education> Educations { get; set; } = null!;
    public DbSet<Certificate> Certificates { get; set; } = null!;
    public DbSet<WorkExperience> WorkExperiences { get; set; } = null!;
    public DbSet<WorkAchievement> WorkAchievements { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<Technology> Technologies { get; set; } = null!;
    public DbSet<ProjectTechnology> ProjectTechnologies { get; set; } = null!;
    public DbSet<WorkExperienceTechnology> WorkExperienceTechnologies { get; set; } = null!;
    public DbSet<SocialLink> SocialLinks { get; set; } = null!;
    public DbSet<Language> Languages { get; set; } = null!;
    public DbSet<Award> Awards { get; set; } = null!;
    public DbSet<Reference> References { get; set; } = null!;

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
            entity.Property(e => e.Id).ValueGeneratedNever(); // GUID generated in code
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
            entity.Property(e => e.Id).ValueGeneratedNever(); // GUID generated in code
            entity.ToTable("WorkAchievements", "public");
            entity.Property(e => e.Text).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });

        // Resume entity configurations
        modelBuilder.Entity<Resume>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever(); // GUID generated in code, not by database
            entity.ToTable("Resumes", "public");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(250);
            entity.Property(e => e.Summary).HasMaxLength(2000);
            entity.Property(e => e.UserId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");

            // Publication fields
            entity.Property(e => e.IsPublic).HasDefaultValue(false);
            entity.Property(e => e.PublicSlug).HasMaxLength(100);
            entity.Property(e => e.PublicConsentIp).HasMaxLength(50);
            entity.HasIndex(e => e.PublicSlug).IsUnique();

            // One-to-one with ContactInfo
            entity
                .HasOne(e => e.Contact)
                .WithOne(c => c.Resume)
                .HasForeignKey<ContactInfo>(c => c.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            // One-to-many relationships
            entity
                .HasMany(e => e.Skills)
                .WithOne(s => s.Resume)
                .HasForeignKey(s => s.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.EducationItems)
                .WithOne(ed => ed.Resume)
                .HasForeignKey(ed => ed.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.Certificates)
                .WithOne(c => c.Resume)
                .HasForeignKey(c => c.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.WorkExperiences)
                .WithOne(w => w.Resume)
                .HasForeignKey(w => w.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.Projects)
                .WithOne(p => p.Resume)
                .HasForeignKey(p => p.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.SocialLinks)
                .WithOne(sl => sl.Resume)
                .HasForeignKey(sl => sl.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.Languages)
                .WithOne(l => l.Resume)
                .HasForeignKey(l => l.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.Awards)
                .WithOne(a => a.Resume)
                .HasForeignKey(a => a.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasMany(e => e.References)
                .WithOne(r => r.Resume)
                .HasForeignKey(r => r.ResumeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ContactInfo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("ContactInfos", "public");
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(200);
        });

        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Skills", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).HasMaxLength(50);
            entity.Property(e => e.Level).IsRequired();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Education>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Educations", "public");
            entity.Property(e => e.Institution).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Degree).IsRequired().HasMaxLength(100);
            entity.Property(e => e.FieldOfStudy).HasMaxLength(100);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Certificate>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Certificates", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Issuer).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CredentialId).HasMaxLength(100);
            entity.Property(e => e.CredentialUrl).HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Projects", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.Link).HasMaxLength(500);
        });

        modelBuilder.Entity<Technology>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Technologies", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Category).HasMaxLength(50);
        });

        // Many-to-many: Project <-> Technology
        modelBuilder.Entity<ProjectTechnology>(entity =>
        {
            entity.HasKey(pt => new { pt.ProjectId, pt.TechnologyId });
            entity.ToTable("ProjectTechnologies", "public");

            entity
                .HasOne(pt => pt.Project)
                .WithMany(p => p.ProjectTechnologies)
                .HasForeignKey(pt => pt.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(pt => pt.Technology)
                .WithMany(t => t.ProjectTechnologies)
                .HasForeignKey(pt => pt.TechnologyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Many-to-many: WorkExperience <-> Technology
        modelBuilder.Entity<WorkExperienceTechnology>(entity =>
        {
            entity.HasKey(wt => new { wt.WorkExperienceId, wt.TechnologyId });
            entity.ToTable("WorkExperienceTechnologies", "public");

            entity
                .HasOne(wt => wt.WorkExperience)
                .WithMany(w => w.WorkExperienceTechnologies)
                .HasForeignKey(wt => wt.WorkExperienceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(wt => wt.Technology)
                .WithMany(t => t.WorkExperienceTechnologies)
                .HasForeignKey(wt => wt.TechnologyId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SocialLink>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("SocialLinks", "public");
            entity.Property(e => e.Platform).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Url).IsRequired().HasMaxLength(500);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("NOW()");
        });

        modelBuilder.Entity<Language>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Languages", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Level).IsRequired();
        });

        modelBuilder.Entity<Award>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("Awards", "public");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Issuer).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
        });

        modelBuilder.Entity<Reference>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.ToTable("References", "public");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Relationship).HasMaxLength(100);
            entity.Property(e => e.ContactInfo).HasMaxLength(200);
        });
    }
}
