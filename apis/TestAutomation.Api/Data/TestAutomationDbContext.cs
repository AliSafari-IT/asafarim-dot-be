using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TestAutomation.Api.Models;

namespace TestAutomation.Api.Data;

public class TestAutomationDbContext : DbContext
{
    public TestAutomationDbContext(DbContextOptions<TestAutomationDbContext> options)
        : base(options) { }

    public DbSet<FunctionalRequirement> FunctionalRequirements { get; set; }
    public DbSet<TestFixture> TestFixtures { get; set; }
    public DbSet<TestSuite> TestSuites { get; set; }
    public DbSet<TestCase> TestCases { get; set; }
    public DbSet<TestDataSet> TestDataSets { get; set; }
    public DbSet<TestRun> TestRuns { get; set; }
    public DbSet<TestResult> TestResults { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure FunctionalRequirement
        modelBuilder.Entity<FunctionalRequirement>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.ProjectName).HasMaxLength(255);
            entity.HasIndex(e => e.CreatedById);
        });

        // Configure TestFixture
        modelBuilder.Entity<TestFixture>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.PageUrl).HasMaxLength(500);

            // Configure JSON columns
            entity
                .Property(e => e.SetupScript)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .Property(e => e.TeardownScript)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .HasOne(e => e.FunctionalRequirement)
                .WithMany(fr => fr.TestFixtures)
                .HasForeignKey(e => e.FunctionalRequirementId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.FunctionalRequirementId);
        });

        // Configure TestSuite
        modelBuilder.Entity<TestSuite>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.GeneratedTestCafeFile).HasColumnType("text");
            entity.Property(e => e.GeneratedAt).HasColumnType("timestamp with time zone");

            entity
                .HasOne(e => e.Fixture)
                .WithMany(f => f.TestSuites)
                .HasForeignKey(e => e.FixtureId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.FixtureId);
        });

        // Configure TestCase
        modelBuilder.Entity<TestCase>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.TestType).HasConversion<string>().HasMaxLength(50);

            // Configure JSON columns
            entity
                .Property(e => e.Steps)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .HasOne(e => e.TestSuite)
                .WithMany(s => s.TestCases)
                .HasForeignKey(e => e.TestSuiteId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TestSuiteId);
        });

        // Configure TestDataSet
        modelBuilder.Entity<TestDataSet>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();

            // Configure data column
            entity
                .Property(e => e.Data)
                .HasColumnType("jsonb")
                .HasConversion(v => v.RootElement.GetRawText(), v => JsonDocument.Parse(v, default))
                .IsRequired();

            entity
                .HasOne(e => e.TestCase)
                .WithMany(tc => tc.TestDataSets)
                .HasForeignKey(e => e.TestCaseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TestCaseId);
        });

        // Configure TestRun
        modelBuilder.Entity<TestRun>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RunName).HasMaxLength(255);
            entity.Property(e => e.Environment).HasMaxLength(100);
            entity.Property(e => e.Browser).HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);
            entity.Property(e => e.TriggerType).HasConversion<string>().HasMaxLength(50);

            entity
                .HasOne(e => e.FunctionalRequirement)
                .WithMany(fr => fr.TestRuns)
                .HasForeignKey(e => e.FunctionalRequirementId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.ExecutedById);
        });

        // Configure TestResult
        modelBuilder.Entity<TestResult>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(50);

            // Configure JSON columns
            entity
                .Property(e => e.Screenshots)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .Property(e => e.JsonReport)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .HasOne(e => e.TestRun)
                .WithMany(tr => tr.TestResults)
                .HasForeignKey(e => e.TestRunId)
                .OnDelete(DeleteBehavior.Cascade);

            entity
                .HasOne(e => e.TestCase)
                .WithMany(tc => tc.TestResults)
                .HasForeignKey(e => e.TestCaseId)
                .OnDelete(DeleteBehavior.SetNull);

            entity
                .HasOne(e => e.TestDataSet)
                .WithMany(tds => tds.TestResults)
                .HasForeignKey(e => e.TestDataSetId)
                .OnDelete(DeleteBehavior.SetNull);

            entity
                .HasOne(e => e.TestSuite)
                .WithMany(ts => ts.TestResults)
                .HasForeignKey(e => e.TestSuiteId)
                .OnDelete(DeleteBehavior.SetNull);

            entity
                .HasOne(e => e.Fixture)
                .WithMany(f => f.TestResults)
                .HasForeignKey(e => e.FixtureId)
                .OnDelete(DeleteBehavior.SetNull);

            entity
                .HasOne(e => e.FunctionalRequirement)
                .WithMany(fr => fr.TestResults)
                .HasForeignKey(e => e.FunctionalRequirementId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.TestRunId);
            entity.HasIndex(e => e.TestCaseId);
        });

        // Configure AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
            entity.Property(e => e.EntityType).HasMaxLength(100);
            entity.Property(e => e.IpAddress).HasMaxLength(45);

            // Configure JSON columns
            entity
                .Property(e => e.OldValues)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity
                .Property(e => e.NewValues)
                .HasColumnType("jsonb")
                .HasConversion(
                    v => v == null ? null : v.RootElement.GetRawText(),
                    v => v == null ? null : JsonDocument.Parse(v, default)
                );

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.EntityType, e.EntityId });
        });
    }
}
