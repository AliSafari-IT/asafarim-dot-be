using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTestResultCountsToTestRun : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FailedTests",
                table: "TestRuns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PassedTests",
                table: "TestRuns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SkippedTests",
                table: "TestRuns",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalTests",
                table: "TestRuns",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FailedTests",
                table: "TestRuns");

            migrationBuilder.DropColumn(
                name: "PassedTests",
                table: "TestRuns");

            migrationBuilder.DropColumn(
                name: "SkippedTests",
                table: "TestRuns");

            migrationBuilder.DropColumn(
                name: "TotalTests",
                table: "TestRuns");
        }
    }
}
