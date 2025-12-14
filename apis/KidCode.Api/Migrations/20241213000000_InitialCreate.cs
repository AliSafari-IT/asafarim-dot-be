using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814

namespace KidCode.Api.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Challenges",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(
                        type: "character varying(255)",
                        maxLength: 255,
                        nullable: false
                    ),
                    Mode = table.Column<string>(type: "text", nullable: false),
                    Prompt = table.Column<string>(
                        type: "character varying(1000)",
                        maxLength: 1000,
                        nullable: false
                    ),
                    StarterBlocksJson = table.Column<string>(type: "jsonb", nullable: true),
                    SuccessCriteria = table.Column<string>(type: "text", nullable: true),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    RewardSticker = table.Column<string>(
                        type: "character varying(100)",
                        maxLength: 100,
                        nullable: true
                    ),
                    IsDaily = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Challenges", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Progresses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(
                        type: "character varying(255)",
                        maxLength: 255,
                        nullable: false
                    ),
                    UnlockedLevelsJson = table.Column<string>(type: "jsonb", nullable: false),
                    BadgesJson = table.Column<string>(type: "jsonb", nullable: false),
                    CompletedChallengesJson = table.Column<string>(type: "jsonb", nullable: false),
                    TotalStickers = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Progresses", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(
                        type: "character varying(255)",
                        maxLength: 255,
                        nullable: false
                    ),
                    Mode = table.Column<string>(type: "text", nullable: false),
                    BlocksJson = table.Column<string>(type: "jsonb", nullable: false),
                    Assets = table.Column<string>(type: "jsonb", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    UpdatedAt = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                }
            );

            migrationBuilder.InsertData(
                table: "Challenges",
                columns: new[]
                {
                    "Id",
                    "CreatedAt",
                    "IsDaily",
                    "Level",
                    "Mode",
                    "Prompt",
                    "RewardSticker",
                    "StarterBlocksJson",
                    "SuccessCriteria",
                    "Title",
                },
                values: new object[,]
                {
                    {
                        new Guid("11111111-1111-1111-1111-111111111111"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Drawing",
                        "Use the Draw Circle block to create your first shape!",
                        "first-circle",
                        "[]",
                        "hasCircle",
                        "Draw a Circle",
                    },
                    {
                        new Guid("22222222-2222-2222-2222-222222222222"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Drawing",
                        "Draw shapes using at least 3 different colors!",
                        "rainbow-artist",
                        "[]",
                        "colorCount>=3",
                        "Rainbow Colors",
                    },
                    {
                        new Guid("33333333-3333-3333-3333-333333333333"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        2,
                        "Drawing",
                        "Use Repeat Magic to create a beautiful pattern!",
                        "pattern-power",
                        "[]",
                        "hasRepeat",
                        "Pattern Power",
                    },
                    {
                        new Guid("44444444-4444-4444-4444-444444444444"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Story",
                        "Make your character walk and jump!",
                        "director-star",
                        "[]",
                        "hasWalk&&hasJump",
                        "Make It Move",
                    },
                    {
                        new Guid("55555555-5555-5555-5555-555555555555"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Story",
                        "Make your character say something fun!",
                        "chatty-star",
                        "[]",
                        "hasSay",
                        "Say Hello",
                    },
                    {
                        new Guid("66666666-6666-6666-6666-666666666666"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Puzzle",
                        "Guide your character through the maze to reach the goal!",
                        "maze-master",
                        "[]",
                        "reachedGoal",
                        "Maze Runner",
                    },
                    {
                        new Guid("77777777-7777-7777-7777-777777777777"),
                        new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc),
                        false,
                        1,
                        "Music",
                        "Play 3 notes to create your first melody!",
                        "music-maker",
                        "[]",
                        "noteCount>=3",
                        "First Melody",
                    },
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Progresses_UserId",
                table: "Progresses",
                column: "UserId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_Projects_UserId",
                table: "Projects",
                column: "UserId"
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Challenges");
            migrationBuilder.DropTable(name: "Progresses");
            migrationBuilder.DropTable(name: "Projects");
        }
    }
}
