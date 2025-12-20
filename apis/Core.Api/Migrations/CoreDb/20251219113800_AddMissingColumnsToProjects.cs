using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Core.Api.Migrations.CoreDb
{
    /// <inheritdoc />
    public partial class AddMissingColumnsToProjects : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShortDescription",
                schema: "public",
                table: "ResumeProjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "GithubUrl",
                schema: "public",
                table: "ResumeProjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DemoUrl",
                schema: "public",
                table: "ResumeProjects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                schema: "public",
                table: "ResumeProjects",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "DisplayOrder",
                schema: "public",
                table: "ResumeProjects",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShortDescription",
                schema: "public",
                table: "ResumeProjects");

            migrationBuilder.DropColumn(
                name: "GithubUrl",
                schema: "public",
                table: "ResumeProjects");

            migrationBuilder.DropColumn(
                name: "DemoUrl",
                schema: "public",
                table: "ResumeProjects");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                schema: "public",
                table: "ResumeProjects");

            migrationBuilder.DropColumn(
                name: "DisplayOrder",
                schema: "public",
                table: "ResumeProjects");
        }
    }
}
