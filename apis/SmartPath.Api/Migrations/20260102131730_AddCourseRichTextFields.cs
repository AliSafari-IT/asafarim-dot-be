using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseRichTextFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DescriptionHtml",
                table: "Tasks",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionJson",
                table: "Tasks",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionHtml",
                table: "Courses",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionJson",
                table: "Courses",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionHtml",
                table: "Chapters",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "DescriptionJson",
                table: "Chapters",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "DescriptionHtml", table: "Tasks");

            migrationBuilder.DropColumn(name: "DescriptionJson", table: "Tasks");

            migrationBuilder.DropColumn(name: "DescriptionHtml", table: "Courses");

            migrationBuilder.DropColumn(name: "DescriptionJson", table: "Courses");

            migrationBuilder.DropColumn(name: "DescriptionHtml", table: "Chapters");

            migrationBuilder.DropColumn(name: "DescriptionJson", table: "Chapters");
        }
    }
}
