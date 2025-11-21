using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGeneratedFilePathToTestSuite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GeneratedFilePath",
                table: "TestSuites",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Remark",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true,
                oldComment: "Tracks generation errors and issues found during test file validation");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GeneratedFilePath",
                table: "TestSuites");

            migrationBuilder.AlterColumn<string>(
                name: "Remark",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                comment: "Tracks generation errors and issues found during test file validation",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
