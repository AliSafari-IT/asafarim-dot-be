using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFamilyScopedOwnershipAndAudit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(name: "IX_Tasks_FamilyId", table: "Tasks");

            migrationBuilder.AddColumn<DateTime>(
                name: "AssignedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "AssignedByUserId",
                table: "Tasks",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEditedAt",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "LastEditedByUserId",
                table: "Tasks",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Lessons",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "FamilyId",
                table: "Lessons",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Lessons",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "FamilyId",
                table: "Courses",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Courses",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.AddColumn<int>(
                name: "CreatedByUserId",
                table: "Chapters",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "FamilyId",
                table: "Chapters",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Chapters",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
            );

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_AssignedByUserId",
                table: "Tasks",
                column: "AssignedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_FamilyId_AssignedToUserId",
                table: "Tasks",
                columns: new[] { "FamilyId", "AssignedToUserId" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_FamilyId_CreatedByUserId",
                table: "Tasks",
                columns: new[] { "FamilyId", "CreatedByUserId" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_LastEditedByUserId",
                table: "Tasks",
                column: "LastEditedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_CreatedByUserId",
                table: "Lessons",
                column: "CreatedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Lessons_FamilyId_CreatedByUserId",
                table: "Lessons",
                columns: new[] { "FamilyId", "CreatedByUserId" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CreatedByUserId",
                table: "Courses",
                column: "CreatedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Courses_FamilyId_CreatedByUserId",
                table: "Courses",
                columns: new[] { "FamilyId", "CreatedByUserId" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_CreatedByUserId",
                table: "Chapters",
                column: "CreatedByUserId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Chapters_FamilyId_CreatedByUserId",
                table: "Chapters",
                columns: new[] { "FamilyId", "CreatedByUserId" }
            );

            // Foreign key constraints will be added in the next migration after data validation
            // This prevents foreign key constraint violations on existing data

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_AssignedByUserId",
                table: "Tasks",
                column: "AssignedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.SetNull
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Tasks_Users_LastEditedByUserId",
                table: "Tasks",
                column: "LastEditedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.SetNull
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Foreign key constraints were not added in Up(), so no need to drop them here
            // They will be dropped in the next migration's Down() method

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_AssignedByUserId",
                table: "Tasks"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Tasks_Users_LastEditedByUserId",
                table: "Tasks"
            );

            migrationBuilder.DropIndex(name: "IX_Tasks_AssignedByUserId", table: "Tasks");

            migrationBuilder.DropIndex(name: "IX_Tasks_FamilyId_AssignedToUserId", table: "Tasks");

            migrationBuilder.DropIndex(name: "IX_Tasks_FamilyId_CreatedByUserId", table: "Tasks");

            migrationBuilder.DropIndex(name: "IX_Tasks_LastEditedByUserId", table: "Tasks");

            migrationBuilder.DropIndex(name: "IX_Lessons_CreatedByUserId", table: "Lessons");

            migrationBuilder.DropIndex(
                name: "IX_Lessons_FamilyId_CreatedByUserId",
                table: "Lessons"
            );

            migrationBuilder.DropIndex(name: "IX_Courses_CreatedByUserId", table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_FamilyId_CreatedByUserId",
                table: "Courses"
            );

            migrationBuilder.DropIndex(name: "IX_Chapters_CreatedByUserId", table: "Chapters");

            migrationBuilder.DropIndex(
                name: "IX_Chapters_FamilyId_CreatedByUserId",
                table: "Chapters"
            );

            migrationBuilder.DropColumn(name: "AssignedAt", table: "Tasks");

            migrationBuilder.DropColumn(name: "AssignedByUserId", table: "Tasks");

            migrationBuilder.DropColumn(name: "LastEditedAt", table: "Tasks");

            migrationBuilder.DropColumn(name: "LastEditedByUserId", table: "Tasks");

            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "Lessons");

            migrationBuilder.DropColumn(name: "FamilyId", table: "Lessons");

            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Lessons");

            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "Courses");

            migrationBuilder.DropColumn(name: "FamilyId", table: "Courses");

            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Courses");

            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "Chapters");

            migrationBuilder.DropColumn(name: "FamilyId", table: "Chapters");

            migrationBuilder.DropColumn(name: "UpdatedAt", table: "Chapters");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_FamilyId",
                table: "Tasks",
                column: "FamilyId"
            );
        }
    }
}
