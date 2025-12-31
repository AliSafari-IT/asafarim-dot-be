using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixFamilyForeignKeyConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, get the first family ID to use as default for orphaned records
            // This ensures all existing records have valid FamilyId values before adding constraints
            migrationBuilder.Sql(@"
                -- For Chapters: update any with FamilyId = 0 to use the first family
                UPDATE ""Chapters"" 
                SET ""FamilyId"" = COALESCE((SELECT MIN(""FamilyId"") FROM ""Families""), 1)
                WHERE ""FamilyId"" = 0 OR ""FamilyId"" IS NULL;

                -- For Courses: update any with FamilyId = 0 to use the first family
                UPDATE ""Courses"" 
                SET ""FamilyId"" = COALESCE((SELECT MIN(""FamilyId"") FROM ""Families""), 1)
                WHERE ""FamilyId"" = 0 OR ""FamilyId"" IS NULL;

                -- For Lessons: update any with FamilyId = 0 to use the first family
                UPDATE ""Lessons"" 
                SET ""FamilyId"" = COALESCE((SELECT MIN(""FamilyId"") FROM ""Families""), 1)
                WHERE ""FamilyId"" = 0 OR ""FamilyId"" IS NULL;
            ");

            // Now add the foreign key constraints that should have been added in the previous migration
            migrationBuilder.AddForeignKey(
                name: "FK_Chapters_Families_FamilyId",
                table: "Chapters",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "FamilyId",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Chapters_Users_CreatedByUserId",
                table: "Chapters",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Families_FamilyId",
                table: "Courses",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "FamilyId",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Users_CreatedByUserId",
                table: "Courses",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Families_FamilyId",
                table: "Lessons",
                column: "FamilyId",
                principalTable: "Families",
                principalColumn: "FamilyId",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Users_CreatedByUserId",
                table: "Lessons",
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
                name: "FK_Chapters_Families_FamilyId",
                table: "Chapters"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Chapters_Users_CreatedByUserId",
                table: "Chapters"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Families_FamilyId",
                table: "Courses"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Users_CreatedByUserId",
                table: "Courses"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Families_FamilyId",
                table: "Lessons"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Users_CreatedByUserId",
                table: "Lessons"
            );
        }
    }
}
