using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KidCode.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGameScoringSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GameSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Mode = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Level = table.Column<int>(type: "integer", nullable: false),
                    StarsEarned = table.Column<int>(type: "integer", nullable: false),
                    TimeSpentSeconds = table.Column<int>(type: "integer", nullable: false),
                    Completed = table.Column<bool>(type: "boolean", nullable: false),
                    MetadataJson = table.Column<string>(type: "jsonb", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserStats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    TotalScore = table.Column<int>(type: "integer", nullable: false),
                    TotalGamesPlayed = table.Column<int>(type: "integer", nullable: false),
                    TotalStarsEarned = table.Column<int>(type: "integer", nullable: false),
                    CurrentLevel = table.Column<int>(type: "integer", nullable: false),
                    ExperiencePoints = table.Column<int>(type: "integer", nullable: false),
                    DrawingHighScore = table.Column<int>(type: "integer", nullable: false),
                    StoryHighScore = table.Column<int>(type: "integer", nullable: false),
                    PuzzleHighScore = table.Column<int>(type: "integer", nullable: false),
                    MusicHighScore = table.Column<int>(type: "integer", nullable: false),
                    DrawingGamesPlayed = table.Column<int>(type: "integer", nullable: false),
                    StoryGamesPlayed = table.Column<int>(type: "integer", nullable: false),
                    PuzzleGamesPlayed = table.Column<int>(type: "integer", nullable: false),
                    MusicGamesPlayed = table.Column<int>(type: "integer", nullable: false),
                    TotalStickers = table.Column<int>(type: "integer", nullable: false),
                    BadgesJson = table.Column<string>(type: "jsonb", nullable: false),
                    UnlockedLevelsJson = table.Column<string>(type: "jsonb", nullable: false),
                    CompletedChallengesJson = table.Column<string>(type: "jsonb", nullable: false),
                    CurrentStreak = table.Column<int>(type: "integer", nullable: false),
                    LongestStreak = table.Column<int>(type: "integer", nullable: false),
                    LastPlayedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserStats", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3470));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3488));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3493));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3499));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3503));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3506));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 19, 25, 42, 725, DateTimeKind.Utc).AddTicks(3509));

            migrationBuilder.CreateIndex(
                name: "IX_GameSessions_CreatedAt",
                table: "GameSessions",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_GameSessions_UserId",
                table: "GameSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GameSessions_UserId_Mode",
                table: "GameSessions",
                columns: new[] { "UserId", "Mode" });

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_DrawingHighScore",
                table: "UserStats",
                column: "DrawingHighScore");

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_MusicHighScore",
                table: "UserStats",
                column: "MusicHighScore");

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_PuzzleHighScore",
                table: "UserStats",
                column: "PuzzleHighScore");

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_StoryHighScore",
                table: "UserStats",
                column: "StoryHighScore");

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_TotalScore",
                table: "UserStats",
                column: "TotalScore");

            migrationBuilder.CreateIndex(
                name: "IX_UserStats_UserId",
                table: "UserStats",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameSessions");

            migrationBuilder.DropTable(
                name: "UserStats");

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6392));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6414));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6421));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6427));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6432));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6437));

            migrationBuilder.UpdateData(
                table: "Challenges",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "CreatedAt",
                value: new DateTime(2025, 12, 14, 13, 2, 41, 247, DateTimeKind.Utc).AddTicks(6444));
        }
    }
}
