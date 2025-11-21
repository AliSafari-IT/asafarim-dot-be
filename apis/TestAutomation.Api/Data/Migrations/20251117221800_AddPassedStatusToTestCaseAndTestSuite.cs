using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPassedStatusToTestCaseAndTestSuite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Passed",
                table: "TestSuites",
                type: "boolean",
                nullable: true,
                comment: "null = never run, true = all passed, false = any failed"
            );

            migrationBuilder.AddColumn<bool>(
                name: "Passed",
                table: "TestCases",
                type: "boolean",
                nullable: true,
                comment: "null = never run, true = passed, false = failed"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Passed", table: "TestSuites");
            migrationBuilder.DropColumn(name: "Passed", table: "TestCases");
        }
    }
}
