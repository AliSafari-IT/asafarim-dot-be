using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartPath.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPracticeItemRichTextFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExpectedAnswerHtml",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );

            migrationBuilder.AddColumn<string>(
                name: "ExpectedAnswerJson",
                table: "PracticeItems",
                type: "text",
                nullable: true
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "ExpectedAnswerHtml", table: "PracticeItems");

            migrationBuilder.DropColumn(name: "ExpectedAnswerJson", table: "PracticeItems");
        }
    }
}
