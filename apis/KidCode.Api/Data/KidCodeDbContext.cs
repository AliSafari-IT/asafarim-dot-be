using KidCode.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KidCode.Api.Data;

public class KidCodeDbContext : DbContext
{
    public KidCodeDbContext(DbContextOptions<KidCodeDbContext> options)
        : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Progress> Progresses => Set<Progress>();
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Album> Albums => Set<Album>();
    public DbSet<CharacterAsset> CharacterAssets => Set<CharacterAsset>();
    public DbSet<GameSession> GameSessions => Set<GameSession>();
    public DbSet<UserStats> UserStats => Set<UserStats>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Mode).HasConversion<string>();
            entity.Property(e => e.BlocksJson).HasColumnType("jsonb");
            entity.Property(e => e.Assets).HasColumnType("jsonb");
            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<Progress>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).HasMaxLength(255).IsRequired();
            entity.Property(e => e.UnlockedLevelsJson).HasColumnType("jsonb");
            entity.Property(e => e.BadgesJson).HasColumnType("jsonb");
            entity.Property(e => e.CompletedChallengesJson).HasColumnType("jsonb");
            entity.HasIndex(e => e.UserId).IsUnique();
        });

        modelBuilder.Entity<Challenge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Mode).HasConversion<string>();
            entity.Property(e => e.Prompt).HasMaxLength(1000);
            entity.Property(e => e.StarterBlocksJson).HasColumnType("jsonb");
            entity.Property(e => e.RewardSticker).HasMaxLength(100);
        });

        modelBuilder.Entity<MediaAsset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FileName).HasMaxLength(500).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.Source).HasMaxLength(50);
            entity.Property(e => e.Content).HasColumnType("bytea").IsRequired();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.AlbumId);
            entity
                .HasOne(e => e.Album)
                .WithMany(a => a.MediaAssets)
                .HasForeignKey(e => e.AlbumId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Album>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<CharacterAsset>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(500);
            entity
                .HasOne(e => e.MediaAsset)
                .WithMany()
                .HasForeignKey(e => e.MediaAssetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<GameSession>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Mode).HasConversion<string>();
            entity.Property(e => e.MetadataJson).HasColumnType("jsonb");
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.UserId, e.Mode });
            entity.HasIndex(e => e.CreatedAt);
        });

        modelBuilder.Entity<UserStats>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserId).HasMaxLength(255).IsRequired();
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(255).IsRequired();
            entity.Property(e => e.BadgesJson).HasColumnType("jsonb");
            entity.Property(e => e.UnlockedLevelsJson).HasColumnType("jsonb");
            entity.Property(e => e.CompletedChallengesJson).HasColumnType("jsonb");
            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.TotalScore);
            entity.HasIndex(e => e.DrawingHighScore);
            entity.HasIndex(e => e.StoryHighScore);
            entity.HasIndex(e => e.PuzzleHighScore);
            entity.HasIndex(e => e.MusicHighScore);
        });

        SeedChallenges(modelBuilder);
    }

    private static void SeedChallenges(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<Challenge>()
            .HasData(
                new Challenge
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Title = "Draw a Circle",
                    Mode = ProjectMode.Drawing,
                    Prompt = "Use the Draw Circle block to create your first shape!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "hasCircle",
                    Level = 1,
                    RewardSticker = "first-circle",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Title = "Rainbow Colors",
                    Mode = ProjectMode.Drawing,
                    Prompt = "Draw shapes using at least 3 different colors!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "colorCount>=3",
                    Level = 1,
                    RewardSticker = "rainbow-artist",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Title = "Pattern Power",
                    Mode = ProjectMode.Drawing,
                    Prompt = "Use Repeat Magic to create a beautiful pattern!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "hasRepeat",
                    Level = 2,
                    RewardSticker = "pattern-power",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Title = "Make It Move",
                    Mode = ProjectMode.Story,
                    Prompt = "Make your character walk and jump!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "hasWalk&&hasJump",
                    Level = 1,
                    RewardSticker = "director-star",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    Title = "Say Hello",
                    Mode = ProjectMode.Story,
                    Prompt = "Make your character say something fun!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "hasSay",
                    Level = 1,
                    RewardSticker = "chatty-star",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                    Title = "Maze Runner",
                    Mode = ProjectMode.Puzzle,
                    Prompt = "Guide your character through the maze to reach the goal!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "reachedGoal",
                    Level = 1,
                    RewardSticker = "maze-master",
                    IsDaily = false,
                },
                new Challenge
                {
                    Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                    Title = "First Melody",
                    Mode = ProjectMode.Music,
                    Prompt = "Play 3 notes to create your first melody!",
                    StarterBlocksJson = "[]",
                    SuccessCriteria = "noteCount>=3",
                    Level = 1,
                    RewardSticker = "music-maker",
                    IsDaily = false,
                }
            );
    }
}
