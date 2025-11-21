using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TestAutomation.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSharedImportsToTestFixture : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SharedImportsPath",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                comment: "Relative path to shared constants/functions for example: import { BASE_URL, loginAsAdmin, resetDb } from '../../shared/test-utils';"
            );

            migrationBuilder.AddColumn<string>(
                name: "SharedImportsContent",
                table: "TestFixtures",
                type: "text",
                nullable: true,
                comment: "Raw TypeScript code to inject: SharedImportsContent is used to inject shared constants/functions into the test file."
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "SharedImportsPath", table: "TestFixtures");
            migrationBuilder.DropColumn(name: "SharedImportsContent", table: "TestFixtures");
        }
    }
}
