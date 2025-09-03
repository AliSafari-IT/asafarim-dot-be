using Ai.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ai.Api.Data
{
    public class SharedDbContext : DbContext
    {
        public SharedDbContext(DbContextOptions<SharedDbContext> options)
            : base(options) { }

        public DbSet<ChatSession> ChatSessions { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ChatSession configuration
            modelBuilder.Entity<ChatSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                entity.Property(e => e.IsArchived).IsRequired();
                entity.Property(e => e.IsDeleted).IsRequired();
                entity.Property(e => e.MessageCount).IsRequired();

                // Indexes for better performance
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.LastMessageAt);
                entity.HasIndex(e => new { e.UserId, e.IsDeleted });
            });

            // ChatMessage configuration
            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.SessionId).IsRequired();
                entity.Property(e => e.UserId).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Content).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.ModelUsed).HasMaxLength(100);

                // Foreign key relationship
                entity
                    .HasOne(e => e.Session)
                    .WithMany(s => s.Messages)
                    .HasForeignKey(e => e.SessionId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Indexes for better performance
                entity.HasIndex(e => e.SessionId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.Role);
            });
        }
    }
}
