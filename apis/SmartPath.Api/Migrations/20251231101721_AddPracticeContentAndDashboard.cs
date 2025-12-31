using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeContentAndDashboard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StreakEntities_ChildUserId",
                table: "StreakEntities"
            );

            migrationBuilder.DropIndex(name: "IX_PracticeItems_LessonId", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "AnswerChoices", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "CorrectAnswer", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "ExplanationText", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "Hints", table: "PracticeItems");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "PracticeItems",
                newName: "ExpectedAnswer"
            );

            migrationBuilder.RenameColumn(
                name: "TimeEstimateSeconds",
                table: "PracticeItems",
                newName: "Points"
            );

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "PracticeItems",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "PracticeItems",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PracticeItems",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.CreateIndex(
                name: "IX_StreakEntities_ChildUserId",
                table: "StreakEntities",
                column: "ChildUserId",
                unique: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_PracticeItems_CreatedByUserId",
                table: "PracticeItems",
                column: "CreatedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PracticeItems_LessonId_IsActive",
                table: "PracticeItems",
                columns: new[] { "LessonId", "IsActive" }
            );

            migrationBuilder.AddForeignKey(
                name: "FK_PracticeItems_Users_CreatedByUserId",
                table: "PracticeItems",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PracticeItems_Users_CreatedByUserId",
                table: "PracticeItems"
            );

            migrationBuilder.DropIndex(
                name: "IX_StreakEntities_ChildUserId",
                table: "StreakEntities"
            );

            migrationBuilder.DropIndex(
                name: "IX_PracticeItems_CreatedByUserId",
                table: "PracticeItems"
            );

            migrationBuilder.DropIndex(
                name: "IX_PracticeItems_LessonId_IsActive",
                table: "PracticeItems"
            );

            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "IsActive", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "UpdatedAt", table: "PracticeItems");

            migrationBuilder.RenameColumn(
                name: "Points",
                table: "PracticeItems",
                newName: "TimeEstimateSeconds"
            );

            migrationBuilder.RenameColumn(
                name: "ExpectedAnswer",
                table: "PracticeItems",
                newName: "Type"
            );

            migrationBuilder.AddColumn<string>(
                name: "AnswerChoices",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "CorrectAnswer",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "ExplanationText",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "Hints",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.CreateIndex(
                name: "IX_StreakEntities_ChildUserId",
                table: "StreakEntities",
                column: "ChildUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_PracticeItems_LessonId",
                table: "PracticeItems",
                column: "LessonId"
            );
        }
    }
}
