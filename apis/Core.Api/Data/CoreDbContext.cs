using Core.Api.Models;
using Microsoft.EntityFrameworkCore;

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
            entity.HasMany(e => e.Messages)
                  .WithOne()
                  .HasForeignKey(e => e.ConversationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<ConversationMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            entity.HasMany(e => e.Attachments)
                  .WithOne()
                  .HasForeignKey(e => e.MessageId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(e => e.Links)
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
            entity.HasMany(e => e.Messages)
                  .WithOne()
                  .HasForeignKey(e => e.ProjectInquiryId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
        
        modelBuilder.Entity<ProjectInquiryMessage>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
        });
    }
}
